import { Check } from "../check.js";

export const SamplesMatchPlaybackRateCheck = Check.create({
  title: {
    ok: "Samples match playback rate is disabled",
    warning: "Samples match playback rate is enabled",
  },
});
