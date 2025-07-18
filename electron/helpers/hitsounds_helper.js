import fs from "fs/promises";
import path from "path";
import { SamplesMatchPlaybackRateCheck } from "../checks/hitsounds/samples_match_playback_rate_check.js";

export async function check_samples_match_playback_rate(
  beatmap_folder_path,
  osu_files
) {
  console.log(
    "Executing function (check_samples_match_playback_rate)",
    beatmap_folder_path
  );

  let samples_match_playback_rate = false;
  for (const osu_file of osu_files) {
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("SamplesMatchPlaybackRate")) {
        const [, value] = line.split(":");
        if (value.trim() === "1") {
          samples_match_playback_rate = true;
          break;
        }
        continue;
      }
    }
    if (samples_match_playback_rate) {
      break;
    }
  }

  let check;
  if (samples_match_playback_rate) {
    check = new SamplesMatchPlaybackRateCheck({ status: "warning" });
  } else {
    check = new SamplesMatchPlaybackRateCheck({ status: "ok" });
  }

  console.log("Checked samples match playback rate", check);
  return check;
}
