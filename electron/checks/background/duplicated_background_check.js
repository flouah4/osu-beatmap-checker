import { Check } from "../check.js";

export const DuplicatedBackgroundCheck = Check.create({
  id: "duplicated_background",
  title: {
    ok: "Background isn't duplicated",
    issue: "Background is duplicated",
  },
  details: {
    issue: "The background file is duplicated at %duplicated_background_path",
  },
});
