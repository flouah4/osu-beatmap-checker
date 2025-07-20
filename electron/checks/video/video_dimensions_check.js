import { Check } from "../check.js";

export const VideoDimensionsCheck = Check.create({
  title: {
    ok: "Video dimensions do not exceed 1280x720 pixels",
    issue: "Video dimensions exceed 1280x720 pixels",
  },
});
