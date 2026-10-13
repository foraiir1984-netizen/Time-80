// Supplementary test invocation only: original date-bound X07 fixture is 2026-10-12.
// This never ships in the app, changes TZ, or replaces live-clock failure evidence.
const NativeDate = globalThis.Date;
const fixtureNow = NativeDate.parse("2026-10-12T12:00:00.000Z");
globalThis.Date = class extends NativeDate {
  constructor(...args) {
    super(...(args.length ? args : [fixtureNow]));
  }
  static now() {
    return fixtureNow;
  }
};
