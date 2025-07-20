import { Check } from "../check.js";

export const WidescreenSupportCheck = Check.create({
  title: {
    info: "Widescreen support is enabled",
    warning: "Widescreen support is disabled",
  },
  details: {
    warning:
      "The widescreen support is disabled although the map has a storyboard.",
  },
});
