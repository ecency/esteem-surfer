/* eslint-disable */
import path from './path';
import {LOCATION_CHANGE} from 'react-router-redux'
import deepFreeze from 'deep-freeze';


describe('path reducer', () => {
    it('should handle initial state', () => {
        expect(path(undefined, {})).toMatchSnapshot();
    });

    it('should handle LOCATION_CHANGE', () => {
        const stateBefore = {
            prev: null,
            cur: null
        };

        deepFreeze(stateBefore);

        const action = {
            type: LOCATION_CHANGE,
            payload: {
                hash: "",
                pathname: "/trending",
                search: "",
                state: undefined
            }
        };

        const stateAfter = {
            prev: null,
            cur: "/trending"
        };

        const res = path(stateBefore, action);
        expect(res).toEqual(stateAfter);
    });

    it('should handle LOCATION_CHANGE', () => {
        const stateBefore = {
            prev: null,
            cur: "/trending"
        };

        deepFreeze(stateBefore);

        const action = {
            type: LOCATION_CHANGE,
            payload: {
                hash: "",
                pathname: "/trending/art",
                search: "",
                state: undefined
            }
        };

        const stateAfter = {
            prev: "/trending",
            cur: "/trending/art"
        };

        const res = path(stateBefore, action);
        expect(res).toEqual(stateAfter);
    });
});

