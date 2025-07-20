import { Check } from "../check.js";

export const OverencodedAudioCheck = Check.create({
  title: {
    ok: "Audio is not encoded upwards from a lower bitrate",
    warning: "Audio may be encoded upwards from a lower bitrate",
  },
  details: {
    ok: "The audio is declared as %header_bitrate kbps with a cut-off at %cutoff_frequency kHz which means it is not overencoded.",
    warning:
      "The audio is declared as %header_bitrate kbps with a cut-off at %cutoff_frequency kHz which means it may be overencoded.",
  },
});
