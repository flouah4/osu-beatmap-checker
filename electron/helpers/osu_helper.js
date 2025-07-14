import fs from "fs/promises";
import path from "path";
import os from "os";
import { parseBuffer } from "music-metadata";
import FFT from "fft.js";
import { spawn } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

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
  console.log("Executing (get_osu_beatmaps)", search);

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

export async function measure_max_frequency_with_ffmpeg(
  audio_path,
  sample_rate = 44100,
  block_size = 4096,
  rel_threshold = 0.02,
  presence_ratio = 0.02
) {
  console.log("[FFMPEG] measuring sustained cutoff for", audio_path);

  const ff = spawn(ffmpegInstaller.path, [
    "-loglevel",
    "quiet",
    "-i",
    audio_path,
    "-f",
    "s16le",
    "-acodec",
    "pcm_s16le",
    "-ar",
    String(sample_rate),
    "-ac",
    "1",
    "pipe:1",
  ]);

  const fft = new FFT(block_size);
  let buffer = Buffer.alloc(0);
  const half = block_size / 2;
  const bin_width = sample_rate / block_size;
  let block_count = 0;
  const bin_counts = new Uint32Array(half);

  for await (const chunk of ff.stdout) {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= block_size * 2) {
      const pcm = new Float32Array(block_size);
      for (let i = 0; i < block_size; i++) {
        pcm[i] = buffer.readInt16LE(i * 2) / 32768;
      }
      buffer = buffer.slice(block_size * 2);
      block_count++;

      const spectrum = fft.createComplexArray();
      fft.realTransform(spectrum, pcm);
      fft.completeSpectrum(spectrum);

      let peak = 0;
      for (let b = 0; b < half; b++) {
        const mag = Math.hypot(spectrum[2 * b], spectrum[2 * b + 1]);
        if (mag > peak) peak = mag;
      }
      const threshold = peak * rel_threshold;

      for (let b = 0; b < half; b++) {
        if (Math.hypot(spectrum[2 * b], spectrum[2 * b + 1]) >= threshold) {
          bin_counts[b]++;
        }
      }
    }
  }

  if (block_count === 0) {
    console.warn("[FFMPEG] no audio blocks processed");
    return 0;
  }

  const min_blocks = Math.ceil(block_count * presence_ratio);
  let cutoff_bin = 0;
  for (let b = 0; b < half; b++) {
    if (bin_counts[b] >= min_blocks) cutoff_bin = b;
  }
  const cutoff_freq = cutoff_bin * bin_width;
  console.log(`[FFMPEG] blocks=${block_count}, min_blocks=${min_blocks}`);
  console.log(`[FFMPEG] sustained cutoff at ~${cutoff_freq.toFixed(1)} Hz`);
  return cutoff_freq;
}

export async function check_overencoded_audio(osu_files, beatmap_folder_path) {
  console.log("=== check_overencoded_audio ===");
  console.log("osu_files:", osu_files);
  console.log("beatmap_folder_path:", beatmap_folder_path);

  let audio_file = null;
  for (const osu_file of osu_files) {
    console.log("[OSU] reading .osu:", osu_file);
    let in_general = false;
    const lines = (
      await fs.readFile(path.join(beatmap_folder_path, osu_file), "utf8")
    ).split(/\r?\n/);
    for (const line of lines) {
      if (line === "[General]") {
        in_general = true;
        continue;
      }
      if (in_general) {
        if (line.startsWith("[")) break;
        const [key, value] = line.split(":");
        if (key === "AudioFilename") {
          audio_file = value.trim();
          console.log("[OSU] found AudioFilename:", audio_file);
          break;
        }
      }
    }
    if (audio_file) break;
  }

  if (!audio_file) {
    console.log("[ERROR] missing AudioFilename");
    return {
      id: "overencoded_audio",
      status: "issue",
      variant: "missing_audio",
    };
  }

  const audio_path = path.join(beatmap_folder_path, audio_file);
  console.log("[AUDIO] audio_path:", audio_path);

  let file_buffer;
  try {
    file_buffer = await fs.readFile(audio_path);
    console.log("[AUDIO] file size:", file_buffer.length, "bytes");
  } catch {
    console.log("[ERROR] could not read audio file");
    return {
      id: "overencoded_audio",
      status: "issue",
      variant: "missing_audio",
    };
  }

  let declared_kbps;
  try {
    const meta = await parseBuffer(file_buffer, {
      mimeType: path.extname(audio_path).slice(1),
    });
    declared_kbps = Math.round(meta.format.bitrate / 1000);
    console.log("[META] declared bitrate:", declared_kbps, "kbps");
  } catch (err) {
    console.log("[WARN] metadata parse failed:", err.message);
  }

  const max_freq = await measure_max_frequency_with_ffmpeg(audio_path);

  const nyquist = 44100 / 2;
  const cutoff_map = {
    128: 16000,
    192: 18000,
    256: 20000,
    320: 22050,
  };
  const expected_cutoff_hz = cutoff_map[declared_kbps] || nyquist;
  console.log("[CALC] expected_cutoff_hz:", expected_cutoff_hz, "Hz");
  console.log(
    "[CALC] expected_cutoff_hz:",
    expected_cutoff_hz.toFixed(1),
    "Hz"
  );
  console.log("[CALC] measured max_freq:", max_freq.toFixed(1), "Hz");

  if (max_freq + 1000 < expected_cutoff_hz) {
    console.log("[RESULT] low_cutoff detected");
    return {
      id: "overencoded_audio",
      status: "issue",
      variant: null,
      args: {
        declared_bitrate: declared_kbps,
        true_bitrate: Math.round(max_freq),
      },
    };
  }

  console.log("[RESULT] audio OK");
  return {
    id: "overencoded_audio",
    status: "ok",
    variant: null,
    args: {
      declared_bitrate: declared_kbps,
      true_bitrate: Math.round(max_freq),
    },
  };
}

export async function check_beatmap(beatmap_id) {
  console.log("=== check_beatmap ===", beatmap_id);

  const songs_path = get_osu_songs_path();
  console.log("[BEATMAP] songs_path:", songs_path);
  const entries = await fs.readdir(songs_path, { withFileTypes: true });

  const dirent = entries.find(
    (e) => e.isDirectory() && e.name.split(" ")[0] === String(beatmap_id)
  );
  console.log("[BEATMAP] selected dirent:", dirent && dirent.name);

  const folder_path = path.join(songs_path, dirent.name);
  console.log("[BEATMAP] folder_path:", folder_path);

  const beatmap_files = await fs.readdir(folder_path);
  const osu_files = beatmap_files.filter((f) => f.endsWith(".osu"));
  console.log("[BEATMAP] osu_files:", osu_files);

  const overencoded_audio_check = await check_overencoded_audio(
    osu_files,
    folder_path
  );

  console.log(
    "=== check_overencoded_audio result ===",
    overencoded_audio_check
  );
  return [overencoded_audio_check];
}
