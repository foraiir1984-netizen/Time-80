// Verification-only host date; normal npm tests do not import this file.
const NativeDate = globalThis.Date;
const hostNow = NativeDate.parse(process.env.TIME80_SIMULATED_HOST_DATE);
if (!Number.isFinite(hostNow)) throw Error("A valid verification host date is required");
globalThis.Date = class extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [hostNow])); }
  static now() { return hostNow; }
};
console.log("# Simulated outer host date:", new Date().toISOString());
