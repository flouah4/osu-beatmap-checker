import fs from "fs/promises";
import path from "path";
import { EpilepsyWarningCheck } from "../checks/storyboard/epilepsy_warning_check.js";

export async function check_epilepsy_warning(
  beatmap_folder_path,
  osu_files
) {
  console.log(
    "Executing function (check_epilepsy_warning)",
    beatmap_folder_path,
    osu_files
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
        continue;
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
