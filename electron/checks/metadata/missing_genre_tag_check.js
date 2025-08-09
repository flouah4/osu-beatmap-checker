import { Check } from "../check.js";

export const MissingGenreTagCheck = Check.create({
  title: {
    ok: "Genre tag present",
    warning: "Genre tag is missing",
  },
  details: {
    warning:
      "Add at least one genre tag such as: rock, pop, electronic, etc. (Ignore if none fit)",
  },
});


