import {LOCATION_CHANGE} from 'react-router-redux';
import {THEME_CHANGED, LIST_STYLE_CHANGED, CURRENCY_CHANGED} from '../actions/global';
import filters from '../constants/filters.json';

const defaultState = {
  selectedFilter: 'trending',
  selectedTag: '',
  theme: 'day',
  listStyle: 'row',
  currency: 'usd',
  currencyRate: 1,
  currencyRateFetching: false,
  currencySymbol: '$',
  language: 'en-US',
  server: 'https://api.steemit.com'
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
      const {newTheme} = action.payload;
      return Object.assign({}, state, {
        theme: newTheme
      });
    }
    case LIST_STYLE_CHANGED: {
      const {newStyle} = action.payload;
      return Object.assign({}, state, {
        listStyle: newStyle
      });
    }
    case CURRENCY_CHANGED: {
      const {newCurrency} = action.payload;
      return Object.assign({}, state, {
        currency: newCurrency
      });
    }
    default:
      return state;
  }
}
