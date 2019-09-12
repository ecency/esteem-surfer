const PREFIX = 'surfer2';

export const getByPrefix = prefix => {
  const prefKey = `${PREFIX}_${prefix}`;

  return Object.keys(localStorage)
    .filter(key => key.indexOf(prefKey) === 0)
    .map(key => JSON.parse(localStorage[key]));
};

export const getItem = (k, def = null) => {
  const key = `${PREFIX}_${k}`;
  return localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key))
    : def;
};

export const setItem = (k, v) => {
  const key = `${PREFIX}_${k}`;
  localStorage.setItem(key, JSON.stringify(v));
};

export const removeItem = k => {
  const key = `${PREFIX}_${k}`;
  localStorage.removeItem(key);
};

export const getVotingPercentage = username =>
  getItem(`voting_percentage_${username}`, 100);

export const setVotingPercentage = (username, val) => {
  setItem(`voting_percentage_${username}`, val);
};

export const getVotingPercentageNeg = username =>
  getItem(`voting_percentage_neg_${username}`, 100);

export const setVotingPercentageNeg = (username, val) => {
  setItem(`voting_percentage_neg_${username}`, val);
};

export const isEntryRead = (author, permlink) =>
  getItem(`read_flag_${author}_${permlink}`, false);

export const setEntryRead = (author, permlink) => {
  setItem(`read_flag_${author}_${permlink}`, true);
};

export const isReleasePostRead = ver => getItem(`release-post-${ver}`, false);

export const setReleasePostRead = ver => {
  setItem(`release-post-${ver}`, 1);
};

export const getRecentTransfers = () => getItem('recent-transfers', []);

export const appendToRecentTransfers = to => {
  const recent = getItem('recent-transfers', []);
  if (!recent.includes(to)) {
    const newRecent = [...new Set([to, ...recent])].slice(0, 100);
    setItem('recent-transfers', newRecent);
  }
};
