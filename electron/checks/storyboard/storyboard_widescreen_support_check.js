import { Check } from "../check.js";

export const StoryboardWidescreenSupportCheck = Check.create({
  /** This check is used when the set has a storyboard */
  id: "storyboard_widescreen_support",
  title: {
    info: "Widescreen support is enabled",
    warning: "Widescreen support is disabled",
  },
});
