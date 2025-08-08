import fs from "fs/promises";
import path from "path";
import os from "os";
import { check_overencoded_audio } from "./audio_helper.js";
import { check_samples_match_playback_rate } from "./hitsounds_helper.js";
import {
  check_epilepsy_warning,
  check_letterbox_during_breaks,
  check_widescreen_support,
} from "./storyboard_helper.js";
import { check_video } from "./video_helper.js";
import { check_duplicated_background } from "./background_helper.js";
import { check_combo_colors, check_preferred_skin } from "./skin_helper.js";
import {
  check_disallowed_artist,
  check_missing_source,
} from "./metadata_helper.js";
import {
  check_difficulty_settings,
  check_multiple_reverses,
} from "./standard_helper.js";

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

export async function get_beatmaps(search = "") {
  /** Gets beatmaps excluding difficulties */

  console.log("Executing function (get_beatmaps)", search);

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
        const beatmap_folder_path = path.join(songs_path, dirent.name);
        const stats = await fs.stat(beatmap_folder_path);
        return { beatmap_folder_path, creation_date: stats.birthtime };
      })
  );

  const recent_maps = stats_list
    .sort((a, b) => b.creation_date - a.creation_date)
    .slice(0, 20);

  const beatmaps = [];
  for (const { beatmap_folder_path } of recent_maps) {
    const beatmap_files = await fs.readdir(beatmap_folder_path);
    const osu_file = beatmap_files.find((file) => file.endsWith(".osu"));
    if (!osu_file) {
      continue;
    }

    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
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
      folder_path: beatmap_folder_path,
      artist: metadata.Artist,
      title: metadata.Title,
      creator: metadata.Creator,
      /**
       * This function does not include the difficulties because
       * the maps are only shown in the sidebar
       */
      difficulties: [],
    });
  }

  return beatmaps;
}

async function get_beatmap_difficulties(beatmap_folder_path, osu_files) {
  /** Gets the difficulties of a beatmap */

  console.log("Executing function (get_beatmap_difficulties)", {
    beatmap_folder_path,
    osu_files,
  });

  const difficulties = [];

  for (const osu_file of osu_files) {
    const file_path = path.join(beatmap_folder_path, osu_file);
    const lines = (await fs.readFile(file_path, "utf8")).split(/\r?\n/);

    let in_metadata = false;
    let name = null;

    for (const line of lines) {
      if (line === "[Metadata]") {
        in_metadata = true;
        continue;
      }
      if (in_metadata) {
        if (line.startsWith("[")) {
          break;
        }
        const [key, value] = line.split(":");
        if (key === "Version") {
          name = value.trim();
          break;
        }
      }
    }

    if (name) {
      difficulties.push({ file_path, name });
    }
  }

  return difficulties;
}

async function get_beatmap(beatmap_folder_path, beatmap_files) {
  /** Gets a beatmap including difficulties */

  console.log("Executing function (get_beatmap)", {
    beatmap_folder_path,
    beatmap_files,
  });

  const osu_files = beatmap_files.filter((file) => file.endsWith(".osu"));
  const osu_file = osu_files[0];

  const lines = (
    await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
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

  const difficulties = await get_beatmap_difficulties(
    beatmap_folder_path,
    osu_files
  );

  return {
    folder_path: beatmap_folder_path,
    artist: metadata.Artist,
    title: metadata.Title,
    creator: metadata.Creator,
    source: metadata.Source,
    tags: metadata.Tags,
    difficulties,
  };
}

export async function check_beatmap_general(beatmap_folder_path) {
  /** Gets the beatmap and its difficulties and does general checks */

  console.log(
    "Executing function (check_beatmap_general)",
    beatmap_folder_path
  );

  const beatmap_files = await fs.readdir(beatmap_folder_path);
  const osu_files = beatmap_files.filter((file) => file.endsWith(".osu"));

  const beatmap = await get_beatmap(beatmap_folder_path, beatmap_files);

  const result = await Promise.all([
    check_overencoded_audio(beatmap_folder_path, osu_files),
    check_video(beatmap_folder_path, osu_files),
    check_duplicated_background(beatmap_folder_path, osu_files),
    check_disallowed_artist(beatmap.artist, beatmap.source, beatmap.tags),
    check_missing_source(beatmap.title, beatmap.source),
  ]);
  /** Check functions can either return a check, an array of checks, or null */
  const checks = result.filter((check) => check !== null).flat();

  const severity_order = ["issue", "warning", "info", "ok"];
  checks.sort(
    (a, b) =>
      severity_order.indexOf(a.status) - severity_order.indexOf(b.status)
  );

  let general_status;
  if (checks.some((check) => check.status === "issue")) {
    general_status = "issue";
  } else if (checks.some((check) => check.status === "warning")) {
    general_status = "warning";
  } else {
    general_status = "ok";
  }

  return { beatmap, general_status, checks };
}

export async function check_beatmap_difficulty(
  beatmap_folder_path,
  osu_file_path
) {
  /** Checks the difficulty of a beatmap */

  console.log("Executing function (check_beatmap_difficulty)", osu_file_path);

  const beatmap_files = await fs.readdir(beatmap_folder_path);

  const result = await Promise.all([
    check_epilepsy_warning(osu_file_path, beatmap_files),
    check_widescreen_support(osu_file_path, beatmap_files),
    check_letterbox_during_breaks(osu_file_path, beatmap_files),
    check_samples_match_playback_rate(osu_file_path),
    check_preferred_skin(osu_file_path),
    check_combo_colors(osu_file_path),
    check_multiple_reverses(osu_file_path),
    check_difficulty_settings(osu_file_path),
  ]);
  /** Check functions can either return a check, an array of checks, or null */
  const checks = result.filter((check) => check !== null).flat();

  const severity_order = ["issue", "warning", "info", "ok"];
  checks.sort(
    (a, b) =>
      severity_order.indexOf(a.status) - severity_order.indexOf(b.status)
  );

  let general_status;
  if (checks.some((check) => check.status === "issue")) {
    general_status = "issue";
  } else if (checks.some((check) => check.status === "warning")) {
    general_status = "warning";
  } else {
    general_status = "ok";
  }

  return { general_status, checks };
}
