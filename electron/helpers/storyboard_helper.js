import fs from "fs/promises";
import { EpilepsyWarningCheck } from "../checks/storyboard/epilepsy_warning_check.js";
import { LetterboxDuringBreaksCheck } from "../checks/storyboard/letterbox_during_breaks_check.js";
import { WidescreenSupportCheck } from "../checks/storyboard/widescreen_support_check.js";

async function has_storyboard(osu_file_path, beatmap_files) {
  let exists_storyboard = false;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("Sprite")) {
      return true;
    }
  }
  if (!exists_storyboard) {
    const exists_osb = beatmap_files.find((file) => file.endsWith(".osb"));
    if (!exists_osb) {
      return false;
    }
  }
}

export async function check_epilepsy_warning(osu_file_path, beatmap_files) {
  console.log("Executing function (check_epilepsy_warning)", osu_file_path);

  const exists_storyboard = await has_storyboard(osu_file_path, beatmap_files);
  if (!exists_storyboard) {
    return null;
  }

  let epilepsy_warning = false;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("EpilepsyWarning")) {
      const [, value] = line.split(":");
      if (value.trim() === "1") {
        epilepsy_warning = true;
        break;
      }
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
  osu_file_path,
  beatmap_files
) {
  console.log(
    "Executing function (check_letterbox_during_breaks)",
    osu_file_path
  );

  const exists_storyboard = await has_storyboard(osu_file_path, beatmap_files);
  if (!exists_storyboard) {
    return null;
  }

  let letterbox_during_breaks = false;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("LetterboxInBreaks")) {
      const [, value] = line.split(":");
      if (value.trim() === "1") {
        letterbox_during_breaks = true;
        break;
      }
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

export async function check_widescreen_support(osu_file_path, beatmap_files) {
  console.log("Executing function (check_widescreen_support)", osu_file_path);

  const exists_storyboard = await has_storyboard(osu_file_path, beatmap_files);
  if (!exists_storyboard) {
    return null;
  }

  let widescreen_support = false;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("WidescreenStoryboard")) {
      const [, value] = line.split(":");
      if (value.trim() === "1") {
        widescreen_support = true;
        break;
      }
    }
  }

  let check;
  if (widescreen_support) {
    check = new WidescreenSupportCheck({ status: "info" });
  } else {
    check = new WidescreenSupportCheck({ status: "warning" });
  }

  console.log("Checked widescreen support", check);
  return check;
}
