import { useEffect } from "react";
export const useFocusEffect = (callback) => useEffect(callback, [callback]);
