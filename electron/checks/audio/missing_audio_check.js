import { Check } from "../check.js";

export const MissingAudioCheck = Check.create({
  id: "missing_audio",
  status: "issue",
  title: "Audio is missing",
});
