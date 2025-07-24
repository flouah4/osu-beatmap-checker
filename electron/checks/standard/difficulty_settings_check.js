import { Check } from "../check.js";

export const DifficultySettingsCheck = Check.create({
  title: {
    ok: "Difficulty settings follow the guidelines",
    warning: "Difficulty settings do not follow the guidelines",
  },
  details: {
    warning:
      "This difficulty does not follow the %difficulty_name difficulty setting guidelines. %difficulty_settings.",
  },
});
