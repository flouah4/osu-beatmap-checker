import { Check } from "../check.js";

export const EpilepsyWarningCheck = Check.create({
  id: "epilepsy_warning",
  title: {
    info: "Epilepsy warning is disabled",
    warning: "Epilepsy warning is enabled",
  },
});
