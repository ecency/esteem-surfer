import post from '../../app/reducers/post';
import {
    FETCH, FETCH_COMPLETE

} from '../../app/actions/post';

import deepFreeze from 'deep-freeze';


describe('reducers', () => {
    describe('post', () => {


        it('should handle initial state', () => {
            expect(post(undefined, {})).toMatchSnapshot();
        });

        it('should handle FETCH', () => {
            const stateBefore = {
                posts: {},
                groups: {}
            };

            deepFreeze(stateBefore);

            const action = {
                type: FETCH,
                payload: {
                    group: 'trending'
                }
            };

            const stateAfter = {
                posts: {},
                groups: {
                    trending: {
                        ids: [],
                        loading: true
                    }
                }
            };

            const res = post(stateBefore, action);

            expect(res).toEqual(stateAfter);
        });

        it('should handle FETCH_COMPLETE', () => {
            const stateBefore = {
                posts: {},
                groups: {
                    trending: {
                        ids: [],
                        loading: true
                    }
                }
            };

            deepFreeze(stateBefore);

            const action = {
                type: FETCH_COMPLETE,
                payload: {
                    data: [
                        {id: 12, author: 'good-karma', permlink: 'welcome to esteem', votes: 5},
                        {id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12},
                        {id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3}
                    ],
                    group: 'trending'
                }
            };

            const stateAfter = {
                posts: {
                    12: {id: 12, author: 'good-karma', permlink: 'welcome to esteem', votes: 5},
                    13: {id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12},
                    14: {id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3}
                },
                groups: {
                    trending: {
                        ids: [12, 13, 14],
                        loading: false
                    }
                }
            };

            const res = post(stateBefore, action);

            expect(res).toEqual(stateAfter);
        });


        it('should handle FETCH_COMPLETE', () => {
            const stateBefore = {
                posts: {
                    12: {id: 12, author: 'good-karma', permlink: 'welcome to esteem', votes: 5},
                    13: {id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12},
                    14: {id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3}
                },
                groups: {
                    trending: {
                        ids: [12, 13, 14],
                        loading: false
                    }
                }
            };

            deepFreeze(stateBefore);

            const action = {
                type: FETCH_COMPLETE,
                payload: {
                    data: [
                        {id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222},
                        {id: 12, author: 'good-karma', permlink: 'welcome to esteem', votes: 21},
                    ],
                    group: 'active'
                }
            };

            const stateAfter = {
                posts: {
                    12: {id: 12, author: 'good-karma', permlink: 'welcome to esteem', votes: 21},
                    13: {id: 13, author: 'talhasch', permlink: 'lorem ipsum', votes: 12},
                    14: {id: 14, author: 'chrisbolten', permlink: 'sit amet', votes: 3},
                    18: {id: 18, author: 'foo', permlink: 'lorem ipsum', votes: 222}
                },
                groups: {
                    trending: {
                        ids: [12, 13, 14],
                        loading: false
                    },
                    active: {
                        ids: [18, 12],
                        loading: false
                    }
                }
            };

            const res = post(stateBefore, action);

            expect(res).toEqual(stateAfter);
        });
    });
});
