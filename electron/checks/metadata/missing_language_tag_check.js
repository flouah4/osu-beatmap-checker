import { Check } from "../check.js";

export const MissingLanguageTagCheck = Check.create({
  title: {
    ok: "Language tag present",
    warning: "Language tag is missing",
  },
  details: {
    warning:
      "Add at least one language tag such as: english, japanese, instrumental, etc. (Ignore if none fit)",
  },
});


