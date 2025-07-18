import fs from "fs/promises";
import path from "path";
import { EpilepsyWarningCheck } from "../checks/storyboard/epilepsy_warning_check.js";
import { LetterboxDuringBreaksCheck } from "../checks/storyboard/letterbox_during_breaks_check.js";
import { StoryboardWidescreenSupportCheck } from "../checks/storyboard/storyboard_widescreen_support_check.js";
import { WidescreenSupportCheck } from "../checks/storyboard/widescreen_support_check.js";

export async function check_epilepsy_warning(beatmap_folder_path, osu_files) {
  console.log(
    "Executing function (check_epilepsy_warning)",
    beatmap_folder_path
  );

  let epilepsy_warning = false;
  for (const osu_file of osu_files) {
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("EpilepsyWarning")) {
        const [, value] = line.split(":");
        if (value.trim() === "1") {
          epilepsy_warning = true;
          break;
        }
      }
    }
    if (epilepsy_warning) {
      break;
    }
  }

  let check;
  if (epilepsy_warning) {
    check = new EpilepsyWarningCheck({ status: "warning" });
  } else {
    check = new EpilepsyWarningCheck({ status: "info" });
  }

  console.log("Checked epilepsy warning", check);
  return check;
}

export async function check_letterbox_during_breaks(
  beatmap_folder_path,
  osu_files
) {
  console.log(
    "Executing function (check_letterbox_during_breaks)",
    beatmap_folder_path
  );

  let letterbox_during_breaks = false;
  for (const osu_file of osu_files) {
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("LetterboxInBreaks")) {
        const [, value] = line.split(":");
        if (value.trim() === "1") {
          letterbox_during_breaks = true;
          break;
        }
      }
    }
    if (letterbox_during_breaks) {
      break;
    }
  }

  let check;
  if (letterbox_during_breaks) {
    check = new LetterboxDuringBreaksCheck({ status: "warning" });
  } else {
    check = new LetterboxDuringBreaksCheck({ status: "ok" });
  }

  console.log("Checked letterbox during breaks", check);
  return check;
}

export async function check_widescreen_support(
  beatmap_folder_path,
  osu_files,
  beatmap_files
) {
  console.log(
    "Executing function (check_widescreen_support)",
    beatmap_folder_path
  );

  let widescreen_support = false;
  let has_storyboard = false;
  for (const osu_file of osu_files) {
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("WidescreenStoryboard")) {
        const [, value] = line.split(":");
        if (value.trim() === "1") {
          widescreen_support = true;
        }
      }
      if (line.startsWith("Sprite")) {
        has_storyboard = true;
      }
      if (widescreen_support && has_storyboard) {
        break;
      }
    }
    if (widescreen_support && has_storyboard) {
      break;
    }
  }

  if (!has_storyboard) {
    const exists_osb = beatmap_files.find((file) => file.endsWith(".osb"));
    if (exists_osb) {
      has_storyboard = true;
    }
  }

  let check;
  if (has_storyboard) {
    if (widescreen_support) {
      check = new StoryboardWidescreenSupportCheck({ status: "info" });
    } else {
      check = new StoryboardWidescreenSupportCheck({ status: "warning" });
    }
  } else {
    if (widescreen_support) {
      check = new WidescreenSupportCheck({ status: "warning" });
    } else {
      check = new WidescreenSupportCheck({ status: "info" });
    }
  }

  console.log("Checked widescreen support", check);
  return check;
}
