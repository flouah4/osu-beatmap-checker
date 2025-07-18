import fs from "fs/promises";
import path from "path";
import imghash from "imghash";
import { DuplicatedBackgroundCheck } from "../checks/background/duplicated_background_check.js";

async function get_folder_image_paths(folder_path) {
  const extensions = [".jpg", ".jpeg", ".png"];
  const entries = await fs.readdir(folder_path, { withFileTypes: true });

  const images = [];
  for (const entry of entries) {
    const entry_path = path.join(folder_path, entry.name);
    if (entry.isDirectory()) {
      const entry_images = await get_folder_image_paths(entry_path);
      images.push(...entry_images);
    } else if (
      entry.isFile() &&
      extensions.includes(path.extname(entry.name).toLowerCase())
    ) {
      images.push(entry_path);
    }
  }
  return images;
}

function hamming_distance(a, b) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

export async function check_duplicated_background(
  beatmap_folder_path,
  osu_files
) {
  console.log(
    "Executing function (check_duplicated_background)",
    beatmap_folder_path
  );

  // 1) Extract background filename from [Events]
  let bg_file = null;
  for (const osu_file of osu_files) {
    let in_events = false;

    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);

    for (const line of lines) {
      if (line === "[Events]") {
        in_events = true;
        continue;
      }
      if (in_events) {
        if (line.startsWith("[")) {
          break;
        }
        if (line.startsWith("0,0,")) {
          const [, , value] = line.split(",");
          bg_file = value.trim().slice(1, -1);
          break;
        }
      }
    }
    if (bg_file) {
      break;
    }
  }

  if (!bg_file) {
    return null;
  }

  const bg_path = path.join(beatmap_folder_path, bg_file);

  // 2) Compute pHash of the background
  let bg_hash;
  try {
    bg_hash = await imghash.hash(bg_path, 16);
  } catch (err) {
    return null;
  }

  // 3) Gather and hash all other images
  const all_image_paths = await get_folder_image_paths(beatmap_folder_path);
  const other_image_paths = all_image_paths.filter(
    (p) => path.resolve(p) !== path.resolve(bg_path)
  );

  const threshold = 10; // tweak as needed
  const duplicated_relative_paths = [];

  for (const img_path of other_image_paths) {
    let hash;
    try {
      hash = await imghash.hash(img_path, 16);
    } catch {
      continue; // skip unreadable images
    }
    if (hamming_distance(bg_hash, hash) <= threshold) {
      duplicated_relative_paths.push(
        path.relative(beatmap_folder_path, img_path)
      );
    }
  }

  // 4) Build and return the check
  let check;
  if (duplicated_relative_paths.length >= 1) {
    check = new DuplicatedBackgroundCheck({
      status: "issue",
      args: {
        duplicated_background_path: duplicated_relative_paths
          .map((p) => `"${p}"`)
          .join(", "),
      },
    });
  } else {
    check = new DuplicatedBackgroundCheck({ status: "ok" });
  }

  console.log("Checked duplicated background", check);
  return check;
}
