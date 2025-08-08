import { Check } from "../check.js";

export const AudioQualityCheck = Check.create({
  title: {
    ok: "Audio quality is within acceptable limits",
    issue: "Audio quality is too high.",
  },
  details: {
    ok: "The audio file has a bitrate of %bitrate kbps which is within acceptable limits for %format files.",
    issue: "The audio file has a bitrate of %bitrate kbps which is higher than the allowed limit of %max_bitrate kbps for %format files.",
  },
});
