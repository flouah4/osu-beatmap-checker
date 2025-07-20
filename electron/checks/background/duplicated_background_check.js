import { Check } from "../check.js";

export const DuplicatedBackgroundCheck = Check.create({
  title: {
    ok: "Background is not duplicated",
    warning: "Background may be duplicated",
  },
  details: {
    warning:
      "The background file may be duplicated at %duplicated_background_paths",
  },
});
