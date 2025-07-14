export interface ICheck {
  id: CheckId;
  status: CheckStatus;
  variant: CheckVariant | null;
  /** For example, { declared_bitrate: 192, true_bitrate: 128 } */
  args: Record<string, any>;
}

export enum CheckId {
  AudioOverencoded = "audio_overencoded",
  SamplesMatchPlaybackRate = "samples_match_playback_rate",
  EpilepsyWarning = "epilepsy_warning",
  LetterboxDuringBreaks = "letterbox_during_breaks",
  VideoEncoderH264 = "video_encoder_h264",
  VideoDimensions1280x720 = "video_dimensions_1280x720",
  VideoAudio = "video_audio",
  WidescreenSupport = "widescreen_support",
}

export enum CheckStatus {
  Ok = "ok",
  Warning = "warning",
  Issue = "issue",
}

export enum CheckVariant {
  MissingAudio = "missing_audio",
}
