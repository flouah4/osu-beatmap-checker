import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import ffprobe from "@ffprobe-installer/ffprobe";
import { VideoAudioCheck } from "../checks/video/video_audio_check.js";
import { VideoDimensionsCheck } from "../checks/video/video_dimensions_check.js";
import { VideoEncoderCheck } from "../checks/video/video_encoder_check.js";
import { VideoOffsetCheck } from "../checks/video/video_offset_check.js";

export async function check_video(beatmap_folder_path, osu_files) {
  console.log("Executing function (check_video)", beatmap_folder_path);

  let video_file = null;
  let video_offset = null;
  for (const osu_file of osu_files) {
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("Video")) {
        const [, offset, value] = line.split(",");
        if (value) {
          video_file = value.trim().slice(1, -1);
          video_offset = +offset;
          break;
        }
        continue;
      }
    }
    if (video_file) {
      break;
    }
  }

  if (!video_file) {
    return null;
  }
  const video_path = path.join(beatmap_folder_path, video_file);

  const video_metadata = await new Promise((resolve, reject) => {
    const proc = spawn(ffprobe.path, [
      "-v",
      "error",
      "-show_streams",
      "-of",
      "json",
      video_path,
    ]);
    let output = "";

    proc.stdout.on("data", (chunk) => (output += chunk));
    proc.stderr.on("data", (chunk) => console.error(chunk.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe exited ${code}`));
      }
      try {
        resolve(JSON.parse(output));
      } catch (err) {
        reject(err);
      }
    });
  });

  const streams = video_metadata.streams || [];
  const video_stream = streams.find((s) => s.codec_type === "video") || {};
  const audio_stream = streams.find((s) => s.codec_type === "audio");

  const codec = video_stream.codec_name;
  const width = video_stream.width;
  const height = video_stream.height;
  const exists_audio = !!audio_stream;

  const checks = [];
  if (codec !== "h264") {
    checks.push(new VideoEncoderCheck({ status: "issue" }));
  } else {
    checks.push(new VideoEncoderCheck({ status: "ok" }));
  }

  if (width < 1280 || height < 720) {
    checks.push(new VideoDimensionsCheck({ status: "issue" }));
  } else {
    checks.push(new VideoDimensionsCheck({ status: "ok" }));
  }

  if (exists_audio) {
    checks.push(new VideoAudioCheck({ status: "issue" }));
  } else {
    checks.push(new VideoAudioCheck({ status: "ok" }));
  }

  if (video_offset === 0) {
    checks.push(new VideoOffsetCheck({ status: "warning" }));
  } else {
    checks.push(new VideoOffsetCheck({ status: "info" }));
  }

  console.log("Checked video", checks);
  return checks;
}
