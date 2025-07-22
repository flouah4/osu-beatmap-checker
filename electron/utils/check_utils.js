export function parse_title(title, status, args) {
  let parsed_title = title;
  if (typeof title === "object") {
    if (!title[status]) {
      throw new Error(`No title found for status ${status}`);
    }
    parsed_title = title[status];
  }

  parsed_title = parsed_title.replace(/%(\w+)/g, (_, arg) => {
    if (!(arg in args)) {
      throw new Error(`Missing argument (${arg})`);
    }
    return args[arg];
  });
  return parsed_title;
}

export function parse_details(details, status, args) {
  if (!details) {
    return [];
  }

  let parsed_details;
  if (typeof details === "string") {
    parsed_details = [details];
  } else if (Array.isArray(details)) {
    parsed_details = details;
  } else if (typeof details === "object") {
    parsed_details = details[status];
    if (!parsed_details) {
      return [];
    } else if (typeof parsed_details === "string") {
      parsed_details = [parsed_details];
    }
  }

  return parsed_details.map((detail) =>
    detail.replace(/%(\w+)/g, (_, arg) => {
      if (!(arg in args)) {
        throw new Error(`Missing argument (${arg})`);
      }
      return args[arg];
    })
  );
}
