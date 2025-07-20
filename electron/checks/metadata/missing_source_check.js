import { Check } from "../check.js";

export const MissingSourceCheck = Check.create({
  title: {
    ok: "Source exists with source marker in the title",
    warning: "Source does not exist",
  },
  details: {
    warning: `The title has a (%marker) marker but the source does not exist.`
  }
})