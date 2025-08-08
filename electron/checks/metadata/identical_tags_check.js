import { Check } from "../check.js";

export const IdenticalTagsCheck = Check.create({
  title: {
    ok: "Tags are identical across all difficulties",
    issue: "Tags differ across difficulties",
  },
  details: {
    issue: [
      "Each difficulty should use the exact same tags.",
      "Diffs with differing tags: %differences",
    ],
  },
});


