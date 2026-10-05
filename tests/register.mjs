import { registerHooks } from "node:module";
registerHooks({
  load(url, context, next) {
    if (url.endsWith(".png"))
      return {
        format: "commonjs",
        source: "module.exports=1;",
        shortCircuit: true,
      };
    return next(url, context);
  },
  resolve(specifier, context, next) {
    if (
      specifier.endsWith("/notificationPlatform") &&
      !process.env.TIME80_REAL_PLATFORM_TEST
    )
      return {
        url: new URL("./notificationPlatform.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "expo")
      return {
        url: new URL("./native-modules.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "expo-notifications")
      return {
        url: new URL("./notifications.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    if (specifier === "@react-navigation/native")
      return {
        url: new URL("./navigation.mjs", import.meta.url).href,
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
