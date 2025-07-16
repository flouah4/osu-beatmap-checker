export interface ICheck {
  id: CheckId;
  status: CheckStatus;
  title: string;
  details: string[];
}

export enum CheckId {
  AudioMissing = "audio_missing",
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
  Info = "info",
  Warning = "warning",
  Issue = "issue",
}
