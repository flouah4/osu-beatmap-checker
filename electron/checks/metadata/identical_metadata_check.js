import { Check } from "../check.js";

export const IdenticalMetadataCheck = Check.create({
  title: {
    ok: "Metadata is consistent across all difficulties",
    issue: "Metadata differs across difficulties",
  },
  details: {
    issue: [
      "Each difficulty should use the exact same metadata (artist/title/unicode/tags/source).",
      "Differences: %differences",
    ],
  },
});


