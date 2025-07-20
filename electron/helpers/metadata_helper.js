import { DisallowedArtistCheck } from "../checks/metadata/disallowed_artist_check.js";
import { MissingSourceCheck } from "../checks/metadata/missing_source_check.js";

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

  return new DisallowedArtistCheck({ status: "ok" });
}

export function check_missing_source(title, source) {
  console.log("Executing function (check_missing_source)", { title, source });

  const markers = ["TV Size", "Short Ver.", "Game Ver.", "Movie Ver."];
  const marker = markers.find((m) =>
    title.toLowerCase().includes(m.toLowerCase())
  );

  console.log("source is", source);
  if (marker) {
    console.log("1");
    if (!source) {
      console.log("2");
      return new MissingSourceCheck({ status: "warning", args: { marker } });
    }
    console.log("3");
    return new MissingSourceCheck({ status: "ok" });
  }
  console.log("4");
  return null;
}
