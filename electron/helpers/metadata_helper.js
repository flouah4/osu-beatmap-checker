import { DisallowedArtistCheck } from "../checks/metadata/disallowed_artist_check.js";
import { MissingSourceCheck } from "../checks/metadata/missing_source_check.js";
import { MissingGenreTagCheck } from "../checks/metadata/missing_genre_tag_check.js";
import { MissingLanguageTagCheck } from "../checks/metadata/missing_language_tag_check.js";

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
