import parseMoney from './parse-money'

export default (content, rate = 1) => {
    if (content.pending_payout_value && content.last_payout === '1970-01-01T00:00:00') {
        return content.total_payout_value ? ((parseMoney(content.total_payout_value) + parseMoney(content.pending_payout_value)) * rate) : 0;
    }

    return content.total_payout_value ? ((parseMoney(content.total_payout_value) + parseMoney(content.curator_payout_value)) * rate) : 0;

}