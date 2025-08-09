import { DisallowedArtistCheck } from "../checks/metadata/disallowed_artist_check.js";
import { MissingSourceCheck } from "../checks/metadata/missing_source_check.js";
import { MissingGenreTagCheck } from "../checks/metadata/missing_genre_tag_check.js";
import { MissingLanguageTagCheck } from "../checks/metadata/missing_language_tag_check.js";
import { IdenticalMetadataCheck } from "../checks/metadata/identical_metadata_check.js";
import fs from "fs/promises";
import path from "path";

export function check_disallowed_artist(artist, source, tags) {
  console.log("Executing function (check_disallowed_artist)", {
    artist,
    source,
    tags,
  });

  const disallowed_artists = [
    "40mP",
    "Draw the Emotional",
    "Enter Shikari",
    "EZFG",
    "Hatsuki Yura",
    "Igorrr",
    "kamome sano",
    "kozato",
    "NOMA",
    "DJMAX",
  ];
  const disallowed_artist = disallowed_artists.find((disallowed_artist) =>
    artist.toLowerCase().includes(disallowed_artist.toLowerCase())
  );
  if (disallowed_artist) {
    return new DisallowedArtistCheck({
      status: "issue",
      args: { artist: disallowed_artist },
    });
  }

  if (source) {
    /** A record made up of artist keys and possible source values */
    const disallowed_sources_record = { DJMax: ["DJMAX"] };
    for (const [artist, disallowed_sources] of Object.entries(
      disallowed_sources_record
    )) {
      if (
        disallowed_sources.some((disallowed_source) =>
          source.toLowerCase().includes(disallowed_source.toLowerCase())
        )
      ) {
        return new DisallowedArtistCheck({
          status: "issue",
          args: { artist },
        });
      }
    }
  }

  if (tags) {
    /** A record made up of artist keys and tag values */
    const disallowed_tags_record = { DJMax: ["djmax", "dj max"] };
    for (const [artist, disallowed_tags] of Object.entries(
      disallowed_tags_record
    )) {
      if (
        disallowed_tags.some((disallowed_tag) =>
          tags.toLowerCase().includes(disallowed_tag.toLowerCase())
        )
      ) {
        return new DisallowedArtistCheck({
          status: "issue",
          args: { artist },
        });
      }
    }
  }

  return new DisallowedArtistCheck({ status: "ok" });
}

export function check_missing_source(title, source) {
  console.log("Executing function (check_missing_source)", { title, source });

  const markers = ["TV Size", "Short Ver.", "Game Ver.", "Movie Ver."];
  const marker = markers.find((m) =>
    title.toLowerCase().includes(m.toLowerCase())
  );
  if (marker) {
    if (!source) {
      return new MissingSourceCheck({ status: "warning", args: { marker } });
    }
    return new MissingSourceCheck({ status: "ok" });
  }
  return null;
}

export function check_missing_genre_tag(tags) {
  console.log("Executing function (check_missing_genre_tag)", { tags });

  const genre_sets = [
    ["video", "game"],
    ["anime"],
    ["rock"],
    ["pop"],
    ["novelty"],
    ["hip", "hop"],
    ["electronic"],
    ["metal"],
    ["classical"],
    ["folk"],
    ["jazz"],
  ];

  if (!tags || typeof tags !== "string" || tags.trim() === "") {
    return new MissingGenreTagCheck({ status: "warning" });
  }

  const normalizedTags = tags.toLowerCase();

  const hasGenre = genre_sets.some((requiredWords) =>
    requiredWords.every((word) => normalizedTags.includes(word))
  );

  if (hasGenre) {
    return new MissingGenreTagCheck({ status: "ok" });
  }

  return new MissingGenreTagCheck({ status: "warning" });
}

export function check_missing_language_tag(tags) {
  console.log("Executing function (check_missing_language_tag)", { tags });

  const language_sets = [

    ["english"],
    ["chinese"],
    ["french"],
    ["german"],
    ["italian"], 
    ["japanese"],
    ["korean"],
    ["spanish"],
    ["swedish"], 
    ["russian"],
    ["polish"],
    ["instrumental"],

    // Following are not web languages, but if we find these in the tags,
    // web would need to be "Other" anyway, so no point in warning.
    ["conlang"],
    ["hindi"],
    ["arabic"],
    ["portugese"],
    ["turkish"],
    ["vietnamese"], 
    ["persian"],
    ["indonesian"],
    ["ukrainian"],
    ["romanian"],
    ["dutch"],
    ["thai"],
    ["greek"],
    ["somali"],
    ["malay"],
    ["hungarian"],
    ["czech"],
    ["norwegian"],
    ["finnish"],
    ["danish"],
    ["latvia"],
    ["lithuanian"],
    ["estonian"],
    ["punjabi"],
    ["bengali"],

    // Some extra ones MV didn't include, probably could be extended infinitely tbh
    ["icelandic"],
    ["bulgarian"],
    ["croatian"],
    ["hebrew"],
    ["mongolian"],
    ["serbian"],
    ["slovak"],
    ["slovenian"],
    ["tagalog"],
    ["tamil"],
    ["telugu"],
    ["urdu"],
  
  ];

  if (!tags || typeof tags !== "string" || tags.trim() === "") {
    return new MissingLanguageTagCheck({ status: "warning" });
  }

  const normalizedTags = tags.toLowerCase();

  const hasLanguage = language_sets.some((requiredWords) =>
    requiredWords.every((word) => normalizedTags.includes(word))
  );

  if (hasLanguage) {
    return new MissingLanguageTagCheck({ status: "ok" });
  }

  return new MissingLanguageTagCheck({ status: "warning" });
}

export async function check_identical_tags_across_difficulties(
  beatmap_folder_path,
  osu_files
) {
  console.log(
    "Executing function (check_identical_tags_across_difficulties)",
    beatmap_folder_path
  );

  const entries = [];

  for (const osu_file of osu_files) {
    const file_path = path.join(beatmap_folder_path, osu_file);
    const lines = (await fs.readFile(file_path, "utf8")).split(/\r?\n/);

    let in_metadata = false;
    const meta = {
      Title: "",
      TitleUnicode: "",
      Artist: "",
      ArtistUnicode: "",
      Tags: "",
      Source: "",
    };
    let diffName = null; // difficulty name from Version

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === "[Metadata]") {
        in_metadata = true;
        continue;
      }
      if (in_metadata) {
        if (line.startsWith("[")) {
          break;
        }
        const [rawKey, ...rest] = line.split(":");
        const key = (rawKey || "").trim();
        const value = rest.join(":").trim();
        if (key in meta) {
          meta[key] = value || "";
        } else if (key === "Version") {
          diffName = value || "";
        }
      }
    }

    if (!diffName || diffName.length === 0) {
      // Fallback to filename if Version missing
      diffName = path.parse(osu_file).name;
    }

    entries.push({
      file: osu_file,
      name: diffName,
      title: meta.Title,
      titleUnicode: meta.TitleUnicode,
      artist: meta.Artist,
      artistUnicode: meta.ArtistUnicode,
      tags: meta.Tags,
      source: meta.Source,
    });
  }

  // Build baseline from the first entry
  const differing = [];

  const fields = [
    { key: "title", label: "Title" },
    { key: "titleUnicode", label: "TitleUnicode" },
    { key: "artist", label: "Artist" },
    { key: "artistUnicode", label: "ArtistUnicode" },
    { key: "tags", label: "Tags" },
    { key: "source", label: "Source" },
  ];

  for (const { key, label } of fields) {
    const valueToEntries = new Map();
    for (const entry of entries) {
      const value = entry[key] ?? "";
      const list = valueToEntries.get(value) || [];
      list.push(entry);
      valueToEntries.set(value, list);
    }

    let maxSize = 0;
    for (const list of valueToEntries.values()) {
      if (list.length > maxSize) maxSize = list.length;
    }
    const maxGroups = [...valueToEntries.values()].filter(
      (list) => list.length === maxSize
    );

    if (maxGroups.length === 1) {
      const majoritySet = new Set(maxGroups[0].map((e) => e.file));
      for (const entry of entries) {
        if (!majoritySet.has(entry.file)) {
          differing.push(`${label} (${entry.name})`);
        }
      }
    } else {
      // Tie: consider all entries as differing for this field
      for (const entry of entries) {
        differing.push(`${label} (${entry.name})`);
      }
    }
  }

  if (differing.length === 0) {
    return new IdenticalMetadataCheck({ status: "ok" });
  }

  const differences = differing.join(", ");
  return new IdenticalMetadataCheck({ status: "issue", args: { differences } });
}
