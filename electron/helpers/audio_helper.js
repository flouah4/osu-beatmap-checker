import fs from "fs/promises";
import path from "path";
import FFT from "fft.js";
import { spawn } from "child_process";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { parseFile } from "music-metadata";
import { OverencodedAudioCheck } from "../checks/audio/overencoded_audio_check.js";
import { TooHighQualityAudioCheck } from "../checks/audio/audio_quality_check.js";

async function get_cutoff_frequency(audio_path) {
  /** Gets the audio cutoff frequency like you would do in spek */

  // 1) spawn ffmpeg to decode to raw 32-bit float PCM, mono, 44.1 kHz
  const sample_rate = 44100;
  const ff = spawn(
    ffmpeg.path,
    [
      "-i",
      audio_path,
      "-f",
      "f32le",
      "-ac",
      "1",
      "-ar",
      String(sample_rate),
      "pipe:1",
    ],
    { stdio: ["ignore", "pipe", "ignore"] }
  );

  // 2) collect all PCM bytes
  const chunks = [];
  for await (const chunk of ff.stdout) {
    chunks.push(chunk);
  }
  await new Promise((res, rej) => ff.on("close", res).on("error", rej));

  // 3) build Float32Array of samples
  const buffer = Buffer.concat(chunks);
  const float_array = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / Float32Array.BYTES_PER_ELEMENT
  );

  // 4) pick a large power‐of‐two segment (e.g. 65536 samples) from the middle
  const SEGMENT_SIZE = 1 << 16; // 65536
  const total = float_array.length;
  const start = Math.max(0, Math.floor(total / 2 - SEGMENT_SIZE / 2));
  const segment = float_array.subarray(start, start + SEGMENT_SIZE);

  // 5) apply a Hann window to reduce spectral leakage
  const windowed = new Float32Array(SEGMENT_SIZE);
  for (let i = 0; i < SEGMENT_SIZE; i++) {
    const hann = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SEGMENT_SIZE - 1)));
    windowed[i] = segment[i] * hann;
  }

  // 6) set up FFT
  const fft = new FFT(SEGMENT_SIZE);
  const complex_in = fft.createComplexArray();
  const complex_out = fft.createComplexArray();

  // interleave real samples, zero imaginary parts
  for (let i = 0; i < SEGMENT_SIZE; i++) {
    complex_in[2 * i] = windowed[i];
    complex_in[2 * i + 1] = 0;
  }

  // 7) run the transform
  fft.transform(complex_out, complex_in);

  // 8) compute magnitudes and corresponding freqs for half‐spectrum
  const half = SEGMENT_SIZE / 2;
  let cutoff_hz = 0;
  let peak_mag = 0;

  for (let i = 0; i < half; i++) {
    const re = complex_out[2 * i];
    const im = complex_out[2 * i + 1];
    const mag = Math.hypot(re, im);
    if (mag > peak_mag) peak_mag = mag;
  }

  const threshold = peak_mag * 0.00001; // e.g. 0.1% of peak
  for (let i = 0; i < half; i++) {
    const re = complex_out[2 * i];
    const im = complex_out[2 * i + 1];
    const mag = Math.hypot(re, im);
    if (mag >= threshold) {
      const freq = (i * sample_rate) / SEGMENT_SIZE;
      cutoff_hz = freq;
    }
  }

  return Math.floor(cutoff_hz / 100);
}

async function get_header_bitrate(audio_path) {
  const metadata = await parseFile(audio_path, { skipCovers: true });
  if (!metadata.format.bitrate) {
    throw new Error("No bitrate field in metadata.format");
  }
  // metadata.format.bitrate is in bits/sec
  return metadata.format.bitrate / 1000;
}

async function get_average_bitrate(audio_path) {
  // Compute true average bitrate from file size and duration
  const [stats, metadata] = await Promise.all([
    fs.stat(audio_path),
    parseFile(audio_path, { skipCovers: true }),
  ]);

  const durationSeconds = metadata?.format?.duration;
  if (!durationSeconds || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    // Fallback: use header bitrate if duration is unavailable
    return await get_header_bitrate(audio_path);
  }

  const bits = stats.size * 8;
  const bitsPerSecond = bits / durationSeconds;
  const kiloBitsPerSecond = bitsPerSecond / 1000;
  return kiloBitsPerSecond;
}

function get_expected_cutoff_frequency(header_bitrate) {
  const expected_bitrate_table = [
    { header_bitrate: 128, cutoff_frequency: 150 },
    { header_bitrate: 192, cutoff_frequency: 175 },
    { header_bitrate: 320, cutoff_frequency: 200 },
  ];

  for (const entry of expected_bitrate_table) {
    if (header_bitrate <= entry.header_bitrate) {
      return entry.cutoff_frequency;
    }
  }
  const expected_cutoff_frequency =
    expected_bitrate_table[expected_bitrate_table.length - 1].cutoff_frequency;
  return expected_cutoff_frequency;
}

async function get_audio_filename(beatmap_folder_path, osu_files) {
  let audio_file = null;
  for (const osu_file of osu_files) {
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
        if (line.startsWith("[")) {
          break;
        }
        const [key, value] = line.split(":");
        if (key === "AudioFilename") {
          audio_file = value.trim();
          break;
        }
      }
    }
    if (audio_file) {
      break;
    }
  }
  return audio_file;
}

export async function check_overencoded_audio(beatmap_folder_path, osu_files) {
  console.log(
    "Executing function (check_overencoded_audio)",
    beatmap_folder_path
  );

  const audio_file = await get_audio_filename(
    beatmap_folder_path,
    osu_files
  );

  if (!audio_file) {
    return null;
  }

  const audio_path = path.join(beatmap_folder_path, audio_file);

  const cutoff_frequency = await get_cutoff_frequency(audio_path);
  const header_bitrate = await get_header_bitrate(audio_path);
  const expected_cutoff_frequency =
    get_expected_cutoff_frequency(header_bitrate);

  let check;
  if (cutoff_frequency < expected_cutoff_frequency) {
    check = new OverencodedAudioCheck({
      status: "warning",
      args: {
        header_bitrate: Math.floor(header_bitrate),
        cutoff_frequency: cutoff_frequency / 10,
      },
    });
  } else {
    check = new OverencodedAudioCheck({
      status: "ok",
      args: {
        header_bitrate: Math.floor(header_bitrate),
        cutoff_frequency: cutoff_frequency / 10,
      },
    });
  }

  console.log("Checked overencoded audio", check);
  return check;
}

export async function check_audio_too_high_quality_wrapper(beatmap_folder_path, osu_files) {
  console.log(
    "Executing function (check_audio_too_high_quality_wrapper)",
    beatmap_folder_path
  );

  const audio_file = await get_audio_filename(
    beatmap_folder_path,
    osu_files
  );

  if (!audio_file) {
    return null;
  }

  const audio_path = path.join(beatmap_folder_path, audio_file);
  return await check_audio_too_high_quality(audio_path);
}

async function check_audio_too_high_quality(audio_path) {
  // Get the file extension to determine format
  const file_extension = path.extname(audio_path).toLowerCase();
  
  // Define bitrate limits for different formats
  const bitrate_limits = {
    '.mp3': 192,
    '.ogg': 208
  };
  
  // Check if the file format is supported
  if (!bitrate_limits[file_extension]) {
    return null; // Skip unsupported formats
  }
  
  try {
    // Use a more accurate bitrate: average kbps computed from file size and duration
    const average_bitrate = await get_average_bitrate(audio_path);
    const max_bitrate = bitrate_limits[file_extension];
    
    let check;
    const rounded = Math.round(average_bitrate);
    if (rounded > max_bitrate) {
      check = new TooHighQualityAudioCheck({
        status: "issue",
        args: {
          bitrate: rounded,
          max_bitrate: max_bitrate,
          format: file_extension.substring(1).toUpperCase(), // Remove the dot and capitalize
        },
      });
    } else {
      check = new TooHighQualityAudioCheck({
        status: "ok",
        args: {
          bitrate: rounded,
          max_bitrate: max_bitrate,
          format: file_extension.substring(1).toUpperCase(), // Remove the dot and capitalize
        },
      });
    }
    
    return check;
  } catch (error) {
    console.error("Error checking audio quality:", error);
    return null;
  }
}