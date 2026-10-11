import { useEffect } from "react";
export const useFocusEffect = (callback) => useEffect(callback, [callback]);
export {
  NavigationContainer,
  DefaultTheme,
  StackActions,
  createNavigationContainerRef,
} from "./app-navigation.mjs";
