export function parse_details(details, args, status) {
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
      throw new Error(`No details found for status (${status})`);
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
