import { parse_details } from "../utils/detail_utils.js"

export class Check {
  constructor({ id, status, title, details, args }) {
    this.id = id;
    this.status = status;
    this.title = title;
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
     */
    this.details = parse_details(details, args, status);
  }

  static create({ id, status, title, details = [] }) {
    if (status) {
      /** Allows the subclass to define their status */
      return class extends Check {
        constructor({ args = {} }) {
          super({ id, status, title, details, args });
        }
      };
    } else {
      /** Allows the subclass to be instantiated with any status */
      return class extends Check {
        constructor({ status, args = {} }) {
          super({ id, status, title, details, args });
        }
      };
    }
  }
}
