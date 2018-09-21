/* eslint-disable */
import { Record, Map, OrderedMap } from 'immutable';

import entries from './entries';
import { EntryGroupRecord } from './entries';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR,
  INVALIDATE
} from '../actions/entries';

import deepFreeze from 'deep-freeze';

describe('entries reducer', () => {
  it('(1) should handle initial state', () => {
    expect(entries(undefined, {})).toMatchSnapshot();
  });

  it('(2) should create group key according to location. action:LOCATION_CHANGE', () => {
    const stateBefore = Map();

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(3) should create group key according to location. action:LOCATION_CHANGE', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/trending/art'
      }
    };
    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(4) should  not create group for non-filter path. action:LOCATION_CHANGE', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/lipsum/art'
      }
    };
    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(5) start fetching "trending". action:FETCH_BEGIN', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(6) start fetching "trending". should keep old entries. action:FETCH_BEGIN', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({ 34: { body: 'foo' }, 12: { body: 'bar' } }),
        err: null,
        loading: false
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(7) fetching "trending" completed. action:FETCH_OK', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_OK,
      payload: {
        data: [
          {
            id: 14,
            author: 'good-karma',
            permlink: 'welcome to esteem',
            votes: 5
          },
          { id: 12, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
          { id: 16, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
        ],
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(8) should not add exiting item to entries. action:FETCH_OK', () => {
    const stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({
          '12': {
            id: 12,
            author: 'good-karma',
            permlink: 'welcome to esteem',
            votes: 5
          }
        }),
        err: null,
        loading: true
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_OK,
      payload: {
        data: [
          {
            id: 12,
            author: 'good-karma',
            permlink: 'welcome to esteem',
            votes: 5
          }
        ],
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(9) simulate load more. action:FETCH_OK', () => {
    let stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    stateBefore = stateBefore.setIn(['trending', 'entries', '14'], {
      id: 14,
      author: 'good-karma',
      permlink: 'welcome to esteem',
      votes: 5
    });
    stateBefore = stateBefore.setIn(['trending', 'entries', '12'], {
      id: 12,
      author: 'talhasch',
      permlink: 'lorem ipsum',
      votes: 12
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_OK,
      payload: {
        data: [
          { id: 16, author: 'chrisbolten', permlink: 'sit amet', votes: 3 },
          { id: 3, author: 'dunsky', permlink: 'lorem', votes: 31 }
        ],
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(10) error occurred while fetching "trending". action:FETCH_ERROR', () => {
    let stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    stateBefore = stateBefore.setIn(['trending', 'entries', '14'], {
      id: 14,
      author: 'good-karma',
      permlink: 'welcome to esteem',
      votes: 5
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_ERROR,
      payload: {
        group: 'trending',
        error: 'an error has occurred'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(11) invalidate "trending". action:INVALIDATE', () => {
    let stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new EntryGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    stateBefore = stateBefore.setIn(['trending', 'entries', '14'], {
      id: 14,
      author: 'good-karma',
      permlink: 'welcome to esteem',
      votes: 5
    });

    deepFreeze(stateBefore);

    const action = {
      type: INVALIDATE,
      payload: {
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(12) should reset error. action:FETCH_BEGIN', () => {
    let stateBefore = Map({
      trending: new EntryGroupRecord({
        entries: OrderedMap({}),
        err: 'an error',
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = entries(stateBefore, action);
    expect(res).toMatchSnapshot();
  });
});
