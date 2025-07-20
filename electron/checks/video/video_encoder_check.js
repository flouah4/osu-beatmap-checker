import { Check } from "../check.js";

export const VideoEncoderCheck = Check.create({
  title: {
    ok: "Video encoder is H.264",
    issue: "Video encoder is not H.264",
  },
});
