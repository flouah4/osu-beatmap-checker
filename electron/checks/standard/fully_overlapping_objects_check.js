import { Check } from "../check.js";

export const FullyOverlappingObjectsCheck = Check.create({
  title: {
    ok: "Close objects do not fully overlap",
    issue: "Close objects fully overlap",
  },
  details: {
    issue: "Two close objects fully overlap at %fully_overlapping_objects.",
  },
});
