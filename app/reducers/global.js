import { LOCATION_CHANGE } from 'react-router-redux';

import { getItem } from '../helpers/storage';

import {
  THEME_CHANGED,
  LIST_STYLE_CHANGED,
  CURRENCY_CHANGED,
  LOCALE_CHANGED,
  PUSH_NOTIFY_CHANGED,
  SERVER_CHANGED,
  PIN_EXPOSED,
  PIN_WIPED,
  SET_INT_CONN
} from '../actions/global';
import filters from '../constants/filters.json';

import defaults from '../constants/defaults';

const defaultState = {
  selectedFilter: defaults.filter,
  selectedTag: '',
  theme: defaults.theme,
  listStyle: getItem('list-style', defaults.listStyle),
  currency: getItem('currency', defaults.currency.currency),
  currencyRate: Number(getItem('currency-rate', defaults.currency.rate)),
  currencySymbol: getItem('currency-symbol', defaults.currency.symbol),
  locale: getItem('locale', defaults.locale),
  pushNotify: Number(getItem('push-notify', defaults.pushNotify)),
  server: getItem('server2', defaults.server),
  pin: null,
  intConn: navigator.onLine
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

      if (path.length > 0 && path[1].startsWith('@') && path[2] === 'feed') {
        return Object.assign({}, state, {
          selectedFilter: 'feed',
          selectedTag: path[1]
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
    case PIN_EXPOSED: {
      const { pin } = action.payload;

      return Object.assign({}, state, {
        pin
      });
    }
    case PIN_WIPED: {
      return Object.assign({}, state, {
        pin: null
      });
    }
    case SET_INT_CONN: {
      const { val } = action.payload;
      return Object.assign({}, state, {
        intConn: val
      });
    }
    default:
      return state;
  }
}
