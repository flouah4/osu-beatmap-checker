import { Check } from "../check.js";

export const DisallowedArtistCheck = Check.create({
  title: {
    ok: "Artist does not explicitely disallow to use their tracks",
    issue: "Artist disallows using their tracks",
  },
  details: {
    issue: `The artist "%artist" disallows using their tracks.`
  }
})