import { Check } from "../check.js";

export const SamplesMatchPlaybackRateCheck = Check.create({
  id: "samples_match_playback_rate",
  title: {
    ok: "Samples match playback rate is disabled",
    warning: "Samples match playback rate is enabled",
  },
});
