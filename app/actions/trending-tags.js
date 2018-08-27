// @flow
import {Client} from 'dsteem';
import type {TtStateType, TtActionType} from '../reducers/types';

export const TT_FETCH_BEGIN = 'TT_FETCH_BEGIN';
export const TT_FETCH_OK = 'TT_FETCH_OK';
export const TT_FETCH_ERROR = 'TT_FETCH_ERROR';


const client = new Client('https://api.steemit.com');

export function fetchTrendingTags(afterTag = '', limit = 50) {
    return (dispatch: (action: TtActionType) => void,
            getState: () => TtStateType) => {
        const {trendingTags} = getState();

        if (trendingTags.list.length >= 1) {
            return
        }

        dispatch(fetchBegin());

        client.database.call('get_trending_tags', [afterTag, limit]).then((resp) => {
            dispatch(fetchOk(resp));

            return resp;
        }).catch(() => {
            dispatch(fetchError());
        })
    };
}


/* action creators */

export const fetchBegin = () => ({
    type: TT_FETCH_BEGIN
});

export const fetchOk = (payload) => ({
    type: TT_FETCH_OK,
    payload
});


export const fetchError = () => ({
    type: TT_FETCH_ERROR
});

