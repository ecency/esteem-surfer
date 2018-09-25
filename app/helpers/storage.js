export const getItem = (k, def = null) => localStorage.getItem(k) || def;

export const setItem = (k, v) => {
  localStorage.setItem(k, v);
};

export const removeItem = k => {
  localStorage.removeItem(k);
};
