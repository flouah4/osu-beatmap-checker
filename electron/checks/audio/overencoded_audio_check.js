import { Check } from "../check.js";

export const OverencodedAudioCheck = Check.create({
  id: "overencoded_audio",
  title: "Audio must not be encoded upwards from a lower bitrate",
  details: {
    ok: "The audio is declared as %header_bitrate kbps with a cut-off at %cutoff_frequency kHz which means it's not overencoded.",
    issue:
      "The audio is declared as %header_bitrate kbps with a cut-off at %cutoff_frequency kHz kHz when the expected cut-off for this bitrate is %expected_cutoff_frequency kHz. The audio must be encoded downwards to avoid file size bloat or it must be changed to a better version.",
  },
});
