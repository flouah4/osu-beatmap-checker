import fs from "fs/promises";
import path from "path";
import os from "os";
import { check_overencoded_audio } from "./audio_helper.js";

function get_osu_songs_path() {
  const home = os.homedir();
  switch (process.platform) {
    case "win32":
      return path.join(process.env.LOCALAPPDATA, "osu!", "Songs");
    case "darwin":
      return path.join(home, "Library", "Application Support", "osu", "Songs");
    case "linux":
      return path.join(home, ".local", "share", "osu", "Songs");
  }
}

export async function get_osu_beatmaps(search = "") {
  console.log("Executing function (get_osu_beatmaps)", search);

  const songs_path = get_osu_songs_path();
  const entries = await fs.readdir(songs_path, { withFileTypes: true });

  const stats_list = await Promise.all(
    entries
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          (!search || dirent.name.toLowerCase().includes(search.toLowerCase()))
      )
      .map(async (dirent) => {
        const folder_path = path.join(songs_path, dirent.name);
        const stats = await fs.stat(folder_path);
        return { dirent, folder_path, added: stats.birthtime };
      })
  );

  const recent_maps = stats_list.sort((a, b) => b.added - a.added).slice(0, 20);

  const beatmaps = [];
  for (const { dirent, folder_path } of recent_maps) {
    const beatmap_id = +dirent.name.split(" ")[0];
    if (isNaN(beatmap_id)) {
      continue;
    }

    const beatmap_files = await fs.readdir(folder_path);
    const osu_file = beatmap_files.find((file) => file.endsWith(".osu"));
    if (!osu_file) {
      continue;
    }

    const lines = (
      await fs.readFile(path.join(folder_path, osu_file), "utf8")
    ).split(/\r?\n/);

    const metadata = {};
    let in_metadata = false;
    for (const line of lines) {
      if (line.trim() === "[Metadata]") {
        in_metadata = true;
        continue;
      }
      if (in_metadata) {
        if (line.startsWith("[")) {
          break;
        }
        const [key, value] = line.split(":");
        metadata[key] = value || null;
      }
    }

    beatmaps.push({
      id: beatmap_id,
      artist: metadata.Artist,
      title: metadata.Title,
      creator: metadata.Creator,
    });
  }

  return beatmaps;
}

export async function check_beatmap(beatmap_id) {
  console.log("Executing function (check_beatmap)", beatmap_id);

  const songs_path = get_osu_songs_path();
  const entries = await fs.readdir(songs_path, { withFileTypes: true });

  const dirent = entries.find(
    (e) => e.isDirectory() && e.name.split(" ")[0] === String(beatmap_id)
  );

  const folder_path = path.join(songs_path, dirent.name);

  const beatmap_files = await fs.readdir(folder_path);
  const osu_files = beatmap_files.filter((f) => f.endsWith(".osu"));

  const overencoded_audio_check = await check_overencoded_audio(
    osu_files,
    folder_path
  );

  return [overencoded_audio_check];
}
