/* eslint-disable */
import { Record, Map, OrderedMap } from 'immutable';

import posts from './posts';
import { PostGroupRecord } from './posts';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  POSTS_FETCH_BEGIN,
  POSTS_FETCH_OK,
  POSTS_FETCH_ERROR,
  POSTS_INVALIDATE
} from '../actions/posts';

import deepFreeze from 'deep-freeze';

describe('posts reducer', () => {
  it('(1) should handle initial state', () => {
    expect(posts(undefined, {})).toMatchSnapshot();
  });

  it('(2) should create group key according to location. action:LOCATION_CHANGE', () => {
    const stateBefore = Map();

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(3) should create group key according to location. action:LOCATION_CHANGE', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
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
    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(4) should  not create group for non-filter path. action:LOCATION_CHANGE', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new PostGroupRecord({
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
    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(5) start fetching "trending". action:POSTS_FETCH_BEGIN', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(6) start fetching "trending". should keep old entries. action:POSTS_FETCH_BEGIN', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({ 34: { body: 'foo' }, 12: { body: 'bar' } }),
        err: null,
        loading: false
      }),
      'trending-art': new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(7) fetching "trending" completed. action:POSTS_FETCH_OK', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_OK,
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

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(8) should not add exiting item to entries. action:POSTS_FETCH_OK', () => {
    const stateBefore = Map({
      trending: new PostGroupRecord({
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
      type: POSTS_FETCH_OK,
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

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(9) simulate load more. action:POSTS_FETCH_OK', () => {
    let stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new PostGroupRecord({
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
      type: POSTS_FETCH_OK,
      payload: {
        data: [
          { id: 16, author: 'chrisbolten', permlink: 'sit amet', votes: 3 },
          { id: 3, author: 'dunsky', permlink: 'lorem', votes: 31 }
        ],
        group: 'trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(10) error occurred while fetching "trending". action:POSTS_FETCH_ERROR', () => {
    let stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: true
      }),
      'trending-art': new PostGroupRecord({
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
      type: POSTS_FETCH_ERROR,
      payload: {
        group: 'trending',
        error: 'an error has occurred'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(11) invalidate "trending". action:POSTS_INVALIDATE', () => {
    let stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: null,
        loading: false
      }),
      'trending-art': new PostGroupRecord({
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
      type: POSTS_INVALIDATE,
      payload: {
        group: 'trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });

  it('(12) should reset error. action:POSTS_INVALIDATE', () => {
    let stateBefore = Map({
      trending: new PostGroupRecord({
        entries: OrderedMap({}),
        err: 'an error',
        loading: false
      })
    });

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    const res = posts(stateBefore, action);
    expect(res).toMatchSnapshot();
  });
});
