import { Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR
} from '../actions/promoted-entries';

import { UPDATE_ENTRY } from '../actions/entries';

const defaultState = Map({
  entries: OrderedMap({}),
  loading: false
});

export default function promotedEntries(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      return state.set('entries', OrderedMap({})).set('loading', false);
    }
    case FETCH_BEGIN: {
      return state.set('loading', true);
    }
    case FETCH_OK: {
      const { data: newEntries } = action.payload;

      let newState = state.set('loading', false).set('entries', OrderedMap({}));

      newEntries.forEach(entry => {
        newState = newState.setIn(
          ['entries', `${entry.author}-${entry.permlink}`],
          entry
        );
      });

      return newState;
    }
    case FETCH_ERROR: {
      return state.set('loading', false);
    }
    case UPDATE_ENTRY: {
      const { data } = action.payload;
      let newState = state.asImmutable();

      if (newState.hasIn(['entries', `${data.author}-${data.permlink}`])) {
        newState = newState.setIn(
          ['entries', `${data.author}-${data.permlink}`],
          data
        );
      }

      return newState;
    }
    default:
      return state;
  }
}
