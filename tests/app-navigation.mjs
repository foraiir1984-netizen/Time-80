import React, { useEffect } from "react";

// Only navigator/native hosts are doubled. App, its handler, coordinator,
// resolver and SQLite test database remain the real project modules.
/** @type {{ready:boolean,autoReady:boolean,onReady:(()=>void)|null,dispatches:any[],dispatch:((action:any)=>void)|null}} */
export const navigationState = {
  ready: true,
  autoReady: true,
  onReady: null,
  dispatches: [],
  dispatch: null,
};
export const DefaultTheme = { colors: {} };
export const StackActions = {
  push: (name, params) => ({ type: "PUSH", name, params }),
};
export const createNavigationContainerRef = () => ({
  isReady: () => navigationState.ready,
  dispatch: (action) => {
    navigationState.dispatch?.(action);
    navigationState.dispatches.push(action);
  },
});
export const NavigationContainer = React.forwardRef(
  function NavigationContainer(props, _ref) {
    useEffect(() => {
      navigationState.onReady = props.onReady;
      if (navigationState.autoReady) props.onReady?.();
      return () => {
        navigationState.onReady = null;
      };
    }, []);
    return React.createElement("NavigationContainer", {}, props.children);
  },
);
const navigator = () => ({
  Navigator: (props) => React.createElement("Navigator", {}, props.children),
  Screen: () => null,
});
export const createNativeStackNavigator = navigator;
export const createBottomTabNavigator = navigator;
export const SafeAreaProvider = (props) =>
  React.createElement("SafeAreaProvider", {}, props.children);
export const SafeAreaView = (props) =>
  React.createElement("SafeAreaView", {}, props.children);
export const useSafeAreaInsets = () => ({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});
