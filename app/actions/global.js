// @flow
import type { GlobalStateType, GlobalActionType } from '../reducers/types';

export const THEME_CHANGED = 'THEME_CHANGED';

export function changeTheme() {
  return (
    dispatch: (action: GlobalActionType) => void,
    getState: () => GlobalStateType
  ) => {
    const { global } = getState();

    const { theme } = global;
    const newTheme = theme === 'day' ? 'night' : 'day';

    localStorage.setItem('theme', newTheme);

    dispatch(themeChanged(newTheme));
  };
}

/* action creators */

export const themeChanged = (newTheme: string) => ({
  type: THEME_CHANGED,
  payload: { newTheme }
});
