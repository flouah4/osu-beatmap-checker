import { Check } from "../check.js";

export const MultipleReversesCheck = Check.create({
  title: {
    ok: "Difficulty does not use short sliders with multiple reverses",
    issue: "Difficulty uses short sliders with multiple reverses",
  },
  details: {
    issue:
      "This difficulty uses short sliders with multiple reverses at %timestamps.",
  },
});
