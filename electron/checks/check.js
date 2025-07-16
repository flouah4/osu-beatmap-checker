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
    this._details = details;
    this._args = args;
  }

  static create({ id, title, details = [] }) {
    return class extends Check {
      constructor(status, args = {}) {
        super({ id, status, title, details, args });
      }
    };
  }

  get details() {
    if (!this._details) {
      return [];
    }

    let details;
    if (typeof this._details === "string") {
      details = [this._details];
    } else if (Array.isArray(this._details)) {
      details = this._details;
    } else if (typeof this._details === "object") {
      details = this._details[this.status];
      if (!details) {
        throw new Error(`No details found for status (${this.status})`);
      } else if (typeof details === "string") {
        details = [details];
      }
    }

    return details.map((detail) =>
      detail.replace(/%(\w+)/g, (placeholder, arg) => {
        if (!(arg in this._args)) {
          throw new Error(
            `Missing argument (${arg}) for placeholder (${placeholder})`
          );
        }
        return this._args[arg];
      })
    );
  }
}
