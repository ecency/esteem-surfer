export const amountFormatCheck = (v) => {
  return /^\d+(\.\d+)?$/.test(v);
};

export const formatStrAmount = (strAmount, asset) => {
  return `${parseFloat(strAmount).toFixed(3)} ${asset}`;
};
