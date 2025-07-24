import { read_osu_lines } from "../utils/osu_utils.js";
import { MultipleReversesCheck } from "../checks/standard/multiple_reverses_check.js";
import { DifficultySettingsCheck } from "../checks/standard/difficulty_settings_check.js";

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

function get_difficulty_data(osu_lines) {
  let section;

  let base_sv = 1;
  let stack_leniency = 7;
  let approach_rate;
  let overall_difficulty;
  let hp_drain_rate;
  let circle_size;
  const timing_points = [];

  for (const raw_line of osu_lines) {
    const line = raw_line.trim();
    if (line === "[Difficulty]" || line === "[TimingPoints]") {
      section = line;
    } else if (line.startsWith("[")) {
      section = null;
    } else if (section === "[Difficulty]") {
      const [key, value] = line.split(":");
      if (key === "SliderMultiplier") {
        base_sv = +value;
      } else if (key === "StackLeniency") {
        stack_leniency = +value;
      } else if (key === "ApproachRate") {
        approach_rate = +value;
      } else if (key === "OverallDifficulty") {
        overall_difficulty = +value;
      } else if (key === "HPDrainRate") {
        hp_drain_rate = +value;
      } else if (key === "CircleSize") {
        hp_drain_rate = +value;
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
  return {
    timing_points,
    base_sv,
    stack_leniency,
    approach_rate,
    overall_difficulty,
    hp_drain_rate,
    circle_size,
  };
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
      const x = +parts[0];
      const y = +parts[1];
      const time = +parts[2];
      const type = +parts[3];

      if (type === 5 || type === 6 || type === 12) {
        combo_count = 1;
      } else {
        combo_count++;
      }

      if (type === 1 || type === 5) {
        hit_objects.push({
          x,
          y,
          time,
          object_type: "circle",
          combo: combo_count,
        });
      } else if (type === 2 || type === 6) {
        const curves = parts[5];
        const slider_parts = curves.split("|").slice(1);
        const [end_x, end_y] = slider_parts.length
          ? slider_parts[slider_parts.length - 1].split(":").map(Number)
          : [x, y];

        const repeat_count = +parts[6];
        const pixel_length = +parts[7];

        hit_objects.push({
          start_x: x,
          start_y: y,
          end_x,
          end_y,
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
        hit_objects.push({
          x,
          y,
          time,
          object_type: "spinner",
          combo: combo_count,
        });
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
  const hard_difficulty_names = ["hard"];
  const insane_difficulty_names = ["insane"];
  const expert_difficulty_names = ["expert", "extra"];

  function includes_difficulty_names(difficulty_names) {
    return difficulty_names.some((d) =>
      difficulty_name.toLowerCase().includes(d.toLowerCase())
    );
  }

  if (includes_difficulty_names(easy_difficulty_names)) {
    return "easy";
  } else if (includes_difficulty_names(normal_difficulty_names)) {
    return "normal";
  } else if (includes_difficulty_names(hard_difficulty_names)) {
    return "hard";
  } else if (includes_difficulty_names(insane_difficulty_names)) {
    return "insane";
  } else if (includes_difficulty_names(expert_difficulty_names)) {
    return "expert";
  } else {
    return null;
  }
}

export async function check_multiple_reverses(osu_file_path) {
  console.log("Executing function (check_multiple_reverses)", osu_file_path);

  const lines = await read_osu_lines(osu_file_path);

  const { base_sv, timing_points } = get_difficulty_data(lines);
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
      check = new MultipleReversesCheck({ status: "ok" });
    }
  }

  console.log("Checked multiple reverses", check);
  return check;
}

export async function check_difficulty_settings(osu_file_path) {
  console.log("Executing function (check_difficulty_settings)", osu_file_path);

  const lines = await read_osu_lines(osu_file_path);

  const { approach_rate, overall_difficulty, hp_drain_rate, circle_size } =
    get_difficulty_data(lines);

  let classified_difficulty_name = classify_difficulty(lines);
  if (!classified_difficulty_name) {
    /** Assume it's an expert until I make (classify_difficulty) more robust */
    classified_difficulty_name = "expert";
  }

  const difficulty_setting_guidelines = {
    easy: {
      ar: { min: null, max: 5 },
      od: { min: 1, max: 3 },
      hp: { min: 1, max: 3 },
      cs: { min: null, max: 4 },
    },
    normal: {
      ar: { min: 4, max: 6 },
      od: { min: 3, max: 5 },
      hp: { min: 3, max: 5 },
      cs: { min: null, max: 5 },
    },
    hard: {
      ar: { min: 6, max: 8 },
      od: { min: 5, max: 7 },
      hp: { min: 4, max: 6 },
      cs: { min: null, max: 6 },
    },
    insane: {
      ar: { min: 7, max: 9.3 },
      od: { min: 7, max: 9 },
      hp: { min: 5, max: 8 },
      cs: { min: null, max: 7 },
    },
    expert: {
      ar: { min: 8, max: null },
      od: { min: 8, max: null },
      hp: { min: 5, max: null },
      cs: { min: null, max: 7 },
    },
  };

  let ar_text = null;
  let od_text = null;
  let hp_text = null;
  let cs_text = null;

  const { ar, od, hp, cs } =
    difficulty_setting_guidelines[classified_difficulty_name];

  if (
    (ar.min && approach_rate < ar.min) ||
    (ar.max && approach_rate > ar.max)
  ) {
    let guideline_text = "";
    if (!ar.min) {
      guideline_text = `${ar.max} or less`;
    } else if (!ar.max) {
      guideline_text = `${ar.min} or higher`;
    } else {
      guideline_text = `between ${ar.min} and ${ar.max}`;
    }
    ar_text = `Current AR (${approach_rate}) should be ${guideline_text}`;
  } else if (
    (od.min && overall_difficulty < od.min) ||
    (od.max && overall_difficulty > od.max)
  ) {
    let guideline_text = "";
    if (!od.min) {
      guideline_text = `${od.max} or less`;
    } else if (!od.max) {
      guideline_text = `${od.min} or higher`;
    } else {
      guideline_text = `between ${od.min} and ${od.max}`;
    }
    od_text = `Current OD (${overall_difficulty}) should be ${guideline_text}`;
  } else if (
    (hp.min && hp_drain_rate < hp.min) ||
    (hp.max && hp_drain_rate > hp.max)
  ) {
    let guideline_text = "";
    if (!hp.min) {
      guideline_text = `${hp.max} or lower`;
    } else if (!hp.max) {
      guideline_text = `${hp.min} or higher`;
    } else {
      guideline_text = `between ${hp.min} and ${hp.max}`;
    }
    hp_text = `Current HP (${hp_drain_rate}) should be ${guideline_text}`;
  }
  if ((cs.min && circle_size < cs.min) || (cs.max && circle_size > cs.max)) {
    let guideline_text = "";
    if (!cs.min) {
      guideline_text = `${cs.max} or lower`;
    } else if (!cs.max) {
      guideline_text = `${cs.min} or higher`;
    } else {
      guideline_text = `between ${cs.min} and ${cs.max}`;
    }
    cs_text = `Current CS (${circle_size}) should be ${guideline_text}`;
  }

  let check;
  if (ar_text || od_text || hp_text || cs_text) {
    check = new DifficultySettingsCheck({
      status: "warning",
      args: {
        difficulty_name: classified_difficulty_name,
        difficulty_settings: [ar_text, od_text, hp_text, cs_text]
          .filter((text) => text !== null)
          .join(", "),
      },
    });
  } else {
    check = new DifficultySettingsCheck({ status: "ok" });
  }

  console.log("Checked difficulty settings", check);
  return check;
}

// export async function check_fully_overlapping_objects(osu_file_path) {
//   console.log(
//     "Executing function (check_fully_overlapping_objects)",
//     osu_file_path
//   );

//   const lines = await read_osu_lines(osu_file_path);

//   const { base_sv, stack_leniency, timing_points } = get_difficulty_data(lines);
//   if (!timing_points.some((tp) => tp.is_uninherited)) {
//     return null;
//   }

//   const classified_difficulty_name = classify_difficulty(
//     lines,
//     base_sv,
//     timing_points
//   );
//   if (!["easy", "normal"].includes(classified_difficulty_name)) {
//     return null;
//   }

//   const hit_objects = get_difficulty_hit_objects(lines, base_sv, timing_points);
//   const fully_overlapping_objects = get_fully_overlapping_objects(
//     hit_objects,
//     stack_leniency,
//     500
//   );

//   let check;
//   if (fully_overlapping_objects.length >= 1) {
//     check = new FullyOverlappingObjectsCheck({
//       status: "issue",
//       args: {
//         fully_overlapping_objects: fully_overlapping_objects
//           .map(
//             (overlap) =>
//               `[timestamp:${overlap.first.time},${overlap.first.combo}] - [timestamp:${overlap.second.time},${overlap.second.combo}] (${overlap.distance_ms} ms)`
//           )
//           .join(", "),
//       },
//     });
//   } else {
//     check = new FullyOverlappingObjectsCheck({ status: "ok" });
//   }

//   console.log("Checked fully overlapping objects", check);
//   return check;
// }
