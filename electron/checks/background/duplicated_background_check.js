import { Check } from "../check.js";

export const DuplicatedBackgroundCheck = Check.create({
  id: "duplicated_background",
  title: {
    ok: "Background isn't duplicated",
    warning: "Background may be duplicated",
  },
  details: {
    warning: "The background file may be duplicated at %duplicated_background_path.",
  },
});
