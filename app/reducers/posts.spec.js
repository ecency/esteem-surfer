/* eslint-disable */

import posts from './posts';
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

  it('(2) start fetching "trending". should handle POSTS_FETCH_BEGIN', () => {
    const stateBefore = {
      groups: {}
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(3) fetching "trending" completed. should handle POSTS_FETCH_OK', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [],
          err: null,
          loading: true
        }
      }
    };

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
          },
          { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
          { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
        ],
        group: 'trending'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(4) start fetching "active". should handle POSTS_FETCH_BEGIN', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'active'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(5) fetching "active" completed. should handle POSTS_FETCH_OK', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        },
        active: {
          data: [],
          err: null,
          loading: true
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_OK,
      payload: {
        data: [
          { id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222 },
          {
            id: 12,
            author: 'good-karma',
            permlink: 'welcome to esteem',
            votes: 21
          }
        ],
        group: 'active'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(6) start fetching "trending" (more). should handle POSTS_FETCH_BEGIN', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        },
        active: {
          data: [
            { id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222 },
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 21
            }
          ],
          err: null,
          loading: false
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(7) error occurred while fetching "trending". should handle POSTS_FETCH_ERROR', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        },
        active: {
          data: [
            { id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222 },
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 21
            }
          ],
          err: null,
          loading: false
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_ERROR,
      payload: {
        group: 'trending',
        error: 'an error has occurred'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(8) start fetching "trending" (more) (again). should handle POSTS_FETCH_BEGIN', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        },
        active: {
          data: [
            { id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222 },
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 21
            }
          ],
          err: null,
          loading: false
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_FETCH_BEGIN,
      payload: {
        group: 'trending'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });

  it('(9) refresh clicked for "trending". should handle POSTS_INVALIDATE', () => {
    const stateBefore = {
      groups: {
        trending: {
          data: [
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 5
            },
            { id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12 },
            { id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3 }
          ],
          err: null,
          loading: false
        },
        active: {
          data: [
            { id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222 },
            {
              id: 12,
              author: 'good-karma',
              permlink: 'welcome to esteem',
              votes: 21
            }
          ],
          err: null,
          loading: false
        }
      }
    };

    deepFreeze(stateBefore);

    const action = {
      type: POSTS_INVALIDATE,
      payload: {
        group: 'trending'
      }
    };

    expect(posts(stateBefore, action)).toMatchSnapshot();
  });
});
