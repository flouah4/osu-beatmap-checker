import { Check } from "../check.js";

export const VideoDimensionsCheck = Check.create({
  id: "video_dimensions",
  title: "Video dimensions don't exceed 1280x720 pixels",
});
