import { parse_details, parse_title } from "../utils/check_utils.js";

export class Check {
  constructor({ status, title, details, args }) {
    /**
     * The status must be one of these:
     * 
     * 1. ok
     * 2. info
     * 3. warning
     * 4. issue
     */
    this.status = status;
    /**
     * A title must be one of the following formats:
     *
     * 1. A string
     * { title: "Audio must not be encoded upwards from a lower bitrate" }
     *
     * 2. An object made up of status keys and string values
     * { title: { info: "Epilepsy warning is disabled", warning: "Epilepsy warning is enabled" } }
     */
    this.title = parse_title(title, status, args);
    /**
     * Details if provided must be one of the formats below and can declare args like %this
     *
     * 1. A string
     * { details: "My name is %name" }
     *
     * 2. An array of strings
     * { details: ["I want to get a new %pet", "This sunday at %time"] }
     *
     * 3. An object made up of status keys and string or array of strings values
     * { details: { ok: "Everything went smooth", issue: ["You may need to check your %source"] } }
     * 
     * Details can also include timestamps written in this format: [timestamp:32154,312]
     */
    this.details = parse_details(details, status, args);
  }

  static create({ status, title, details = [] }) {
    if (status) {
      /** Allows the subclass to define their status */
      return class extends Check {
        constructor({ args = {} }) {
          super({ status, title, details, args });
        }
      };
    } else {
      /** Allows the subclass to be instantiated with any status */
      return class extends Check {
        constructor({ status, args = {} }) {
          super({ status, title, details, args });
        }
      };
    }
  }
}
