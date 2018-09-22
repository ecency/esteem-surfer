export const THEME_CHANGED = 'global/THEME_CHANGED';
export const LIST_STYLE_CHANGED = 'global/LIST_STYLE_CHANGED';
export const CURRENCY_CHANGED = 'global/CURRENCY_CHANGED';

export const changeTheme = () => (dispatch, getState) => {
  const {global} = getState();

  const {theme} = global;
  const newTheme = theme === 'day' ? 'night' : 'day';

  localStorage.setItem('theme', newTheme);
  window.setTheme(newTheme);

  dispatch(themeChanged(newTheme));
};

export const changeListStyle = () => (dispatch, getState) => {
  const {global} = getState();

  const {listStyle} = global;

  const newStyle = listStyle === 'row' ? 'grid' : 'row';

  localStorage.setItem('list-style', newStyle);

  dispatch(listStyleChanged(newStyle));
};


export const changeCurrency = (newCurrency) => (dispatch) => {
  console.log(newCurrency)
  // localStorage.setItem('list-style', newCurrency);

  dispatch(listStyleChanged(newCurrency));
};


/* action creators */

export const themeChanged = newTheme => ({
  type: THEME_CHANGED,
  payload: {newTheme}
});

export const listStyleChanged = newStyle => ({
  type: LIST_STYLE_CHANGED,
  payload: {newStyle}
});

export const currencyChanged = (newCurrency) => ({
  type: CURRENCY_CHANGED,
  payload: {newCurrency}
});