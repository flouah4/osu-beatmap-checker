import { Check } from "../check.js";

export const AudioTooHighQualityCheck = Check.create({
  title: {
    ok: "Audio is not too high quality",
    issue: "Audio is too high quality",
  },
  details: {
    ok: "The audio file has a bitrate of %bitrate kbps which is not too high for %format files.",
    issue: "The audio file has a bitrate of %bitrate kbps which exceeds the maximum allowed %max_bitrate kbps for %format files.",
  },
});
