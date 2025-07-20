import { Check } from "../check.js";

export const VideoOffsetCheck = Check.create({
  title: {
    info: "Video offset is changed",
    warning: "Video offset is not changed",
  },
});
