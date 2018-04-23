export const amountFormatCheck = (v) => {
  return /^\d+(\.\d+)?$/.test(v);
};

export const formatStrAmount = (strAmount, asset) => {
  return `${parseFloat(strAmount).toFixed(3)} ${asset}`;
};

export const isUrl = (u) => {
  return u.startsWith('http://') || u.startsWith('https://');
};


export const amountPrecisionCheck = (v) => {
  const dotParts = v.split('.');
  if (dotParts.length > 1) {
    const precision = dotParts[1];
    if (precision.length > 3) {
      return false;
    }
  }

  return true;
};
