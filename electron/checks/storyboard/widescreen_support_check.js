import { Check } from "../check.js";

export const WidescreenSupportCheck = Check.create({
  /** This check is used when the set doesn't have a storyboard */
  id: "widescreen_support",
  title: {
    info: "Widescreen support is disabled",
    warning: "Widescreen support is enabled",
  },
});
