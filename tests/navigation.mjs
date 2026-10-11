import { useEffect } from "react";
const effects = new Set();
let focused = true;
export const useFocusEffect = (callback) =>
  useEffect(() => {
    const effect = { callback, cleanup: null };
    effects.add(effect);
    if (focused) effect.cleanup = callback();
    return () => {
      effect.cleanup?.();
      effects.delete(effect);
    };
  }, [callback]);
export function emitFocus(next) {
  if (next === focused) return;
  focused = next;
  for (const effect of effects) {
    if (next) effect.cleanup = effect.callback();
    else {
      effect.cleanup?.();
      effect.cleanup = null;
    }
  }
}
export const focusListenerCount = () => effects.size;
export {
  NavigationContainer,
  DefaultTheme,
  StackActions,
  createNavigationContainerRef,
} from "./app-navigation.mjs";
