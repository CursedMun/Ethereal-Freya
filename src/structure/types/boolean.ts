import { FreyaClient } from "../FreyaClient";
import { ArgumentType } from "./base";

export class BooleanArgumentType extends ArgumentType {
  readonly Client: FreyaClient;
  constructor(client: FreyaClient) {
    super(client, "boolean");
    this.truthy = new Set([
      "true",
      "t",
      "yes",
      "y",
      "on",
      "enable",
      "enabled",
      "1",
      "+",
    ]);
    this.falsy = new Set([
      "false",
      "f",
      "no",
      "n",
      "off",
      "disable",
      "disabled",
      "0",
      "-",
    ]);
  }

  validate(val: string) {
    const lc = val.toLowerCase();
    return this.truthy.has(lc) || this.falsy.has(lc);
  }

  parse(val: string) {
    const lc = val.toLowerCase();
    if (this.truthy.has(lc)) return true;
    if (this.falsy.has(lc)) return false;
    throw new RangeError("Unknown boolean value.");
  }
}
