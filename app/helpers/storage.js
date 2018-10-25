const PREFIX = 'surfer';


export const getByPrefix = (prefix) => {
  const prefKey = `${PREFIX}_${prefix}`;

  return Object.keys(localStorage).filter((key) => (key.indexOf(prefKey) === 0)).map((key) => JSON.parse(localStorage[key]));
};

export const getItem = (k, def = null) => {
  const key = `${PREFIX}_${k}`;
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : def;
};

export const setItem = (k, v) => {
  const key = `${PREFIX}_${k}`;
  localStorage.setItem(key, JSON.stringify(v));
};

export const removeItem = k => {
  const key = `${PREFIX}_${k}`;
  localStorage.removeItem(key);
};


export const getVotingPercentage = username => getItem(`voting_percentage_${username}`, 100);

export const setVotingPercentage = (username, val) => {
  setItem(`voting_percentage_${username}`, val);
};