import getSymbolFromCurrency from 'currency-symbol-map';
import { setItem } from '../helpers/storage';
import { setAddress } from '../backend/steem-client';

export const THEME_CHANGED = 'global/THEME_CHANGED';
export const LIST_STYLE_CHANGED = 'global/LIST_STYLE_CHANGED';
export const CURRENCY_CHANGED = 'global/CURRENCY_CHANGED';
export const LOCALE_CHANGED = 'global/LOCALE_CHANGED';
export const PUSH_NOTIFY_CHANGED = 'global/PUSH_NOTIFY_CHANGED';
export const SERVER_CHANGED = 'global/SERVER_CHANGED';

export const PIN_EXPOSED = 'global/PIN_EXPOSED';
export const PIN_WIPED = 'global/PIN_WIPED';

export const SET_INT_CONN = 'global/SET_INT_CONN';

export const changeTheme = () => (dispatch, getState) => {
  const { global } = getState();

  const { theme } = global;
  const newTheme = theme === 'day' ? 'night' : 'day';

  setItem('theme', newTheme);
  window.setTheme(newTheme);

  dispatch(themeChanged(newTheme));
};

export const changeListStyle = () => (dispatch, getState) => {
  const { global } = getState();

  const { listStyle } = global;

  const newStyle = listStyle === 'row' ? 'grid' : 'row';

  setItem('list-style', newStyle);

  dispatch(listStyleChanged(newStyle));
};

export const changeCurrency = (currency, currencyRate) => dispatch => {
  const symbol = getSymbolFromCurrency(currency);

  setItem('currency', currency);
  setItem('currency-rate', currencyRate);
  setItem('currency-symbol', symbol);

  dispatch(currencyChanged(currency, currencyRate, symbol));
};

export const changeLocale = locale => dispatch => {
  setItem('locale', locale);

  dispatch(localeChanged(locale));
};

export const changePushNotify = val => dispatch => {
  setItem('push-notify', val);

  dispatch(pushNotifyChanged(val));
};

export const changeServer = server => dispatch => {
  setItem('server2', server);

  setAddress(server);

  dispatch(serverChanged(server));
};

export const exposePin = pin => dispatch => {
  dispatch(pinExposed(pin));
};

export const wipePin = () => dispatch => {
  dispatch(pinWiped());
};

export const setIntConn = val => dispatch => {
  dispatch(intConnSet(val));
};

/* action creators */

export const themeChanged = newTheme => ({
  type: THEME_CHANGED,
  payload: { newTheme }
});

export const listStyleChanged = newStyle => ({
  type: LIST_STYLE_CHANGED,
  payload: { newStyle }
});

export const currencyChanged = (currency, currencyRate, currencySymbol) => ({
  type: CURRENCY_CHANGED,
  payload: { currency, currencyRate, currencySymbol }
});

export const localeChanged = locale => ({
  type: LOCALE_CHANGED,
  payload: { locale }
});

export const pushNotifyChanged = val => ({
  type: PUSH_NOTIFY_CHANGED,
  payload: { val }
});

export const serverChanged = server => ({
  type: SERVER_CHANGED,
  payload: { server }
});

export const pinExposed = pin => ({
  type: PIN_EXPOSED,
  payload: { pin }
});

export const pinWiped = () => ({
  type: PIN_WIPED
});

export const intConnSet = val => ({
  type: SET_INT_CONN,
  payload: { val }
});
