import { Check } from "../check.js";

export const LetterboxDuringBreaksCheck = Check.create({
  id: "letterbox_during_breaks",
  title: {
    ok: "Letterbox during breaks is disabled",
    warning: "Letterbox during breaks is enabled",
  },
});
