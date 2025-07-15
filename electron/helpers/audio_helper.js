import fs from "fs/promises";
import path from "path";
import FFT from "fft.js";
import { spawn } from "child_process";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { parseFile } from "music-metadata";

async function get_cutoff_bitrate(audio_path) {
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

  const threshold = peak_mag * 0.001; // e.g. 0.1% of peak
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

export async function get_header_bitrate(audio_path) {
  const metadata = await parseFile(audio_path, { skipCovers: true });
  if (!metadata.format.bitrate) {
    throw new Error("No bitrate field in metadata.format");
  }
  // metadata.format.bitrate is in bits/sec
  return metadata.format.bitrate / 1000;
}

function get_expected_cutoff_bitrate(header_bitrate) {
  const expected_bitrate_table = [
    { header_bitrate: 64, cutoff_bitrate: 80 },
    { header_bitrate: 96, cutoff_bitrate: 120 },
    { header_bitrate: 128, cutoff_bitrate: 150 },
    { header_bitrate: 192, cutoff_bitrate: 180 },
    { header_bitrate: 320, cutoff_bitrate: 200 },
  ];

  for (const entry of expected_bitrate_table) {
    if (header_bitrate <= entry.header_bitrate) {
      return entry.cutoff_bitrate;
    }
  }
  return expected_bitrate_table[expected_bitrate_table.length - 1]
    .cutoff_bitrate;
}

export async function check_overencoded_audio(osu_files, beatmap_folder_path) {
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
        if (line.startsWith("[")) break;
        const [key, value] = line.split(":");
        if (key === "AudioFilename") {
          audio_file = value.trim();
          break;
        }
      }
    }
  }

  if (!audio_file) {
    console.log("Audio is missing");
    return {
      id: "overencoded_audio",
      status: "issue",
      variant: "missing_audio",
    };
  }

  const audio_path = path.join(beatmap_folder_path, audio_file);

  const cutoff_bitrate = await get_cutoff_bitrate(audio_path);
  const header_bitrate = await get_header_bitrate(audio_path);

  const expected_cutoff_bitrate = get_expected_cutoff_bitrate(header_bitrate);
  const check = {
    id: "overencoded_audio",
    status: "ok",
    variant: null,
    details: { header_bitrate, cutoff_bitrate, expected_cutoff_bitrate },
  };
  if (cutoff_bitrate < expected_cutoff_bitrate) {
    check.status = "issue";
  }
  console.log("Checked overencoded audio", check);
  return check;
}
