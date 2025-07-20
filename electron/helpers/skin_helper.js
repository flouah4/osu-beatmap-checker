import fs from "fs/promises";
import { PreferredSkinCheck } from "../checks/skin/preferred_skin_check.js";
import { ComboColorsCheck } from "../checks/skin/combo_colors_check.js";

export async function check_preferred_skin(osu_file_path) {
  console.log("Executing function (check_preferred_skin)", osu_file_path);

  let preferred_skin = null;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("SkinPreference")) {
      const [, value] = line.split(":");
      preferred_skin = value.trim();
      break;
    }
  }

  let check;
  if (preferred_skin) {
    check = new PreferredSkinCheck({
      status: "warning",
      args: { preferred_skin },
    });
  } else {
    check = new PreferredSkinCheck({ status: "ok" });
  }

  console.log("Checked preferred skin", check);
  return check;
}

export async function check_combo_colors(osu_file_path) {
  console.log("Executing function (check_combo_colors)", osu_file_path);

  let exist_combo_colors = false;
  const lines = (await fs.readFile(osu_file_path, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    if (line === "[Colours]") {
      exist_combo_colors = true;
      break;
    }
  }

  let check;
  if (!exist_combo_colors) {
    check = new ComboColorsCheck({ status: "warning" });
  } else {
    check = new ComboColorsCheck({ status: "ok" });
  }

  console.log("Checked preferred skin", check);
  return check;
}
