import { Check } from "../check.js";

export const ComboColorsCheck = Check.create({
  title: {
    ok: "Map has custom combo colors",
    warning: "Map does not have custom combo colors",
  },
});
