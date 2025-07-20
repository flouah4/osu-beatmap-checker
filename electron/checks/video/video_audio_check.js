import { Check } from "../check.js";

export const VideoAudioCheck = Check.create({
  title: {
    ok: "Video does not have audio",
    issue: "Video has an audio track",
  },
});
