import { read_osu_lines } from "../utils/osu_utils.js";
import { MultipleReversesCheck } from "../checks/standard/multiple_reverses_check.js";

function get_timing_point(time, timing_points, is_uninherited) {
  const before = timing_points
    .filter((tp) => tp.is_uninherited === is_uninherited && tp.time <= time)
    .sort((a, b) => b.time - a.time)[0];

  if (before) {
    return before;
  }

  const after = timing_points
    .filter((tp) => tp.is_uninherited === is_uninherited)
    .sort((a, b) => a.time - b.time)[0];

  if (after) {
    return after;
  }
  return null;
}

function get_slider_duration_ms(time, pixel_length, base_sv, timing_points) {
  const uninherited_tp = get_timing_point(time, timing_points, true);
  const inherited_tp = get_timing_point(time, timing_points, false);

  const sv_multiplier = inherited_tp ? 100 / -inherited_tp.beat_length_ms : 1;

  return (
    (pixel_length / (100 * base_sv * sv_multiplier)) *
    uninherited_tp.beat_length_ms
  );
}

function get_difficulty_sv_and_timing(osu_lines) {
  let section;
  let base_sv = 1;

  const timing_points = [];

  for (const raw_line of osu_lines) {
    const line = raw_line.trim();
    if (line === "[Difficulty]" || line === "[TimingPoints]") {
      section = line;
      continue;
    } else if (line.startsWith("[")) {
      section = null;
      continue;
    } else if (section === "[Difficulty]") {
      const [key, value] = line.split(":");
      if (key === "SliderMultiplier") {
        base_sv = +value;
      }
    } else if (section === "[TimingPoints]") {
      const parts = line.split(",");
      const time = +parts[0];
      const beat_length_ms = +parts[1];
      const is_uninherited =
        parts[6] !== undefined ? +parts[6] === 1 : beat_length_ms > 0;
      timing_points.push({ time, beat_length_ms, is_uninherited });
    }
  }
  return { base_sv, timing_points };
}

function get_difficulty_hit_objects(osu_lines, base_sv, timing_points) {
  let in_hit_objects = false;
  let combo_count = 1;

  const hit_objects = [];

  for (const raw_line of osu_lines) {
    const line = raw_line.trim();
    if (line === "[HitObjects]") {
      in_hit_objects = true;
      continue;
    }
    if (in_hit_objects) {
      if (line.startsWith("[")) {
        break;
      }
      const parts = line.split(",");
      const time = +parts[2];
      const type = +parts[3];

      if (type === 5 || type === 6 || type === 12) {
        combo_count = 1;
      } else {
        combo_count++;
      }

      if (type === 1 || type === 5) {
        hit_objects.push({ time, object_type: "circle" });
      } else if (type === 2 || type === 6) {
        const repeat_count = +parts[6];
        const pixel_length = +parts[7];

        hit_objects.push({
          time,
          object_type: "slider",
          combo: combo_count,
          reverses_amount: Math.max(0, repeat_count - 1),
          duration_ms: get_slider_duration_ms(
            time,
            pixel_length,
            base_sv,
            timing_points
          ),
        });
      } else if (type === 8 || type === 12) {
        hit_objects.push({ time, object_type: "spinner" });
      }
    }
  }

  return hit_objects;
}

function classify_difficulty(osu_lines) {
  let difficulty_name = null;
  for (const line of osu_lines) {
    if (line.startsWith("Version")) {
      const [, value] = line.split(":");
      difficulty_name = value.trim();
    }
  }
  if (!difficulty_name) {
    return null;
  }

  const easy_difficulty_names = ["easy"];
  const normal_difficulty_names = ["normal"];

  function includes_difficulty_names(difficulty_names) {
    return difficulty_names.some((d) =>
      difficulty_name.toLowerCase().includes(d.toLowerCase())
    );
  }

  if (includes_difficulty_names(easy_difficulty_names)) {
    return "easy";
  } else if (includes_difficulty_names(normal_difficulty_names)) {
    return "normal";
  } else {
    return null;
  }
}

export async function check_multiple_reverses(osu_file_path) {
  console.log("Executing function (check_multiple_reverses)", osu_file_path);

  const lines = await read_osu_lines(osu_file_path);

  const { base_sv, timing_points } = get_difficulty_sv_and_timing(lines);
  if (!timing_points.some((tp) => tp.is_uninherited)) {
    return null;
  }

  const classified_difficulty_name = classify_difficulty(
    lines,
    base_sv,
    timing_points
  );
  if (!["easy", "normal"].includes(classified_difficulty_name)) {
    return null;
  }
  const hit_objects = get_difficulty_hit_objects(lines, base_sv, timing_points);

  function get_multiple_reverse_sliders(unallowed_slider_duration_ms) {
    /** Finds sliders with multiple reverses whose duration is the same or below (unallowed_slider_duration_ms) */

    return hit_objects.filter(
      (hit_object) =>
        hit_object.object_type === "slider" &&
        hit_object.duration_ms <= unallowed_slider_duration_ms &&
        hit_object.reverses_amount >= 2
    );
  }

  let check;
  if (classified_difficulty_name === "easy") {
    const unallowed_sliders = get_multiple_reverse_sliders(500);
    if (unallowed_sliders.length >= 1) {
      check = new MultipleReversesCheck({
        status: "issue",
        args: {
          timestamps: unallowed_sliders
            .map(
              (hit_object) =>
                `[timestamp:${hit_object.time},${hit_object.combo}]`
            )
            .join(" - "),
        },
      });
    } else {
      check = new MultipleReversesCheck({
        status: "ok",
      });
    }
  } else if (classified_difficulty_name === "normal") {
    const unallowed_sliders = get_multiple_reverse_sliders(250);
    if (unallowed_sliders.length >= 1) {
      check = new MultipleReversesCheck({
        status: "issue",
        args: {
          rhythm_snap: "1/2",
          timestamps: unallowed_sliders
            .map(
              (hit_object) =>
                `[timestamp:${hit_object.time},${hit_object.combo}]`
            )
            .join("-"),
        },
      });
    } else {
      check = new MultipleReversesCheck({
        status: "ok",
        args: { rhythm_snap: "1/2" },
      });
    }
  }

  console.log("Checked multiple reverses", check);
  return check;
}
