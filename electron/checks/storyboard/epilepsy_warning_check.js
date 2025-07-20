import { Check } from "../check.js";

export const EpilepsyWarningCheck = Check.create({
  title: {
    info: "Epilepsy warning is disabled",
    warning: "Epilepsy warning is enabled",
  },
});
