import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "expo-notifications")
      return {
        url: new URL("./notifications.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "react-native")
      return {
        url: new URL("./react-native.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "expo-sqlite")
      return {
        url: new URL("./sqlite.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "expo-crypto")
      return {
        url: new URL("./crypto.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    return next(specifier, context);
  },
});
