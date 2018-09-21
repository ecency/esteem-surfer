import parseToken from './parse-token';

export default entry => {
  if (
    entry.pending_payout_value &&
    entry.last_payout === '1970-01-01T00:00:00'
  ) {
    return entry.total_payout_value
      ? parseToken(entry.total_payout_value) +
          parseToken(entry.pending_payout_value)
      : 0;
  }

  return entry.total_payout_value
    ? parseToken(entry.total_payout_value) +
        parseToken(entry.curator_payout_value)
    : 0;
};
