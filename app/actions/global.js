// @flow
import type { GlobalStateType, commonActionType } from '../reducers/types';

export const THEME_CHANGED = 'THEME_CHANGED';
export const LIST_STYLE_CHANGED = 'LIST_STYLE_CHANGED';

export const changeTheme = () => (
  dispatch: (action: commonActionType) => void,
  getState: () => GlobalStateType
) => {
  const { global } = getState();

  const { theme } = global;
  const newTheme = theme === 'day' ? 'night' : 'day';

  localStorage.setItem('theme', newTheme);
  window.setTheme(newTheme);

  dispatch(themeChanged(newTheme));
};

export const changeListStyle = () => (
  dispatch: (action: commonActionType) => void,
  getState: () => GlobalStateType
) => {
  const { global } = getState();

  const { listStyle } = global;

  const newStyle = listStyle === 'row' ? 'grid' : 'row';

  localStorage.setItem('list-style', newStyle);

  dispatch(listStyleChanged(newStyle));
};

/* action creators */

export const themeChanged = (newTheme: string) => ({
  type: THEME_CHANGED,
  payload: { newTheme }
});

export const listStyleChanged = (newStyle: string) => ({
  type: LIST_STYLE_CHANGED,
  payload: { newStyle }
});
