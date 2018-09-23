import { LOCATION_CHANGE } from 'react-router-redux';

import {
  THEME_CHANGED,
  LIST_STYLE_CHANGED,
  CURRENCY_CHANGED,
  LOCALE_CHANGED,
  PUSH_NOTIFY_CHANGED,
  SERVER_CHANGED
} from '../actions/global';
import filters from '../constants/filters.json';

import defaults from '../constants/defaults';

const defaultState = {
  selectedFilter: defaults.filter,
  selectedTag: '',
  theme: defaults.theme,
  listStyle: defaults.listStyle,
  currency: localStorage.getItem('currency') || defaults.currency.currency,
  currencyRate: Number(
    localStorage.getItem('currency-rate') || defaults.currency.rate
  ),
  currencySymbol:
    localStorage.getItem('currency-symbol') || defaults.currency.symbol,
  locale: localStorage.getItem('locale') || defaults.locale,
  pushNotify: Number(
    localStorage.getItem('push-notify') || defaults.pushNotify
  ),
  server: localStorage.getItem('server') || defaults.server
};

export default function global(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      const path = action.payload.pathname.split('/');
      if (path.length > 0 && filters.includes(path[1])) {
        const filter = path[1];
        const tag = path[2] || '';

        return Object.assign({}, state, {
          selectedFilter: filter,
          selectedTag: tag
        });
      }

      return state;
    }
    case THEME_CHANGED: {
      const { newTheme } = action.payload;
      return Object.assign({}, state, {
        theme: newTheme
      });
    }
    case LIST_STYLE_CHANGED: {
      const { newStyle } = action.payload;
      return Object.assign({}, state, {
        listStyle: newStyle
      });
    }
    case CURRENCY_CHANGED: {
      const { currency, currencyRate, currencySymbol } = action.payload;

      return Object.assign({}, state, {
        currency,
        currencyRate,
        currencySymbol
      });
    }
    case LOCALE_CHANGED: {
      const { locale } = action.payload;

      return Object.assign({}, state, {
        locale
      });
    }
    case PUSH_NOTIFY_CHANGED: {
      const { val } = action.payload;

      return Object.assign({}, state, {
        pushNotify: val
      });
    }
    case SERVER_CHANGED: {
      const { server } = action.payload;

      return Object.assign({}, state, {
        server
      });
    }
    default:
      return state;
  }
}
