import fs from "fs/promises";

export async function read_osu_lines(osu_file_path) {
  const lines = await fs.readFile(osu_file_path, "utf8");
  return lines.split(/\r?\n/);
}
