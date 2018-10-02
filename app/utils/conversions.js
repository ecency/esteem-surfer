export const vestsToSp = (vests, steemPerMVests) => {
  return vests / 1e6 * steemPerMVests;
};

const spToVests = (sp, steemPerMVests) => {
  return sp * 1e6 / steemPerMVests;
};