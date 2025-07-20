import fs from "fs/promises";
import { SamplesMatchPlaybackRateCheck } from "../checks/hitsounds/samples_match_playback_rate_check.js";

export async function check_samples_match_playback_rate(osu_file_path) {
  console.log(
    "Executing function (check_samples_match_playback_rate)",
    osu_file_path
  );

  let samples_match_playback_rate = false;
  const lines = (
    await fs.readFile(osu_file_path, "utf8")
  ).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("SamplesMatchPlaybackRate")) {
      const [, value] = line.split(":");
      if (value.trim() === "1") {
        samples_match_playback_rate = true;
        break;
      }
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
