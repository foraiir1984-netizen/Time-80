// Native font IO only; real UI typography/fallback is exercised by renderer tests.
/** @type {{ready:boolean,error:Error|null}} */
export const fontState = { ready: true, error: null };
export const useFonts = () => [fontState.ready, fontState.error];
