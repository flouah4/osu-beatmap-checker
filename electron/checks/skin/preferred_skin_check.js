import { Check } from "../check.js";

export const PreferredSkinCheck = Check.create({
  title: {
    ok: "Preferred skin is default",
    warning: "Preferred skin is not default",
  },
  details: {
    warning: `The preferred skin is "%preferred_skin".`,
  },
});
