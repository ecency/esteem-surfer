import { Client } from 'dsteem';

export const TT_FETCH_BEGIN = 'TT_FETCH_BEGIN';
export const TT_FETCH_OK = 'TT_FETCH_OK';
export const TT_FETCH_ERROR = 'TT_FETCH_ERROR';

const client = new Client('https://api.steemit.com');

const shuffle = arr => {
  const arry = arr;
  for (let i = arry.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arry[i];
    arry[i] = arry[j];
    arry[j] = temp;
  }
  return arry;
};

export function fetchTrendingTags(afterTag = '', limit = 100) {
  return (dispatch, getState) => {
    const { trendingTags } = getState();

    if (trendingTags.list.length >= 1) {
      return;
    }

    dispatch(fetchBegin());

    client.database
      .call('get_trending_tags', [afterTag, limit])
      .then(resp => {
        const sresp = shuffle(resp);

        dispatch(fetchOk(sresp));

        return sresp;
      })
      .catch(() => {
        dispatch(fetchError());
      });
  };
}

/* action creators */

export const fetchBegin = () => ({
  type: TT_FETCH_BEGIN
});

export const fetchOk = payload => ({
  type: TT_FETCH_OK,
  payload
});

export const fetchError = () => ({
  type: TT_FETCH_ERROR
});
