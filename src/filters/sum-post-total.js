export default ($rootScope) => {
  return (post) => {

    if(!post){
      return null;
    }

    let rate = $rootScope.currencyRate;

    if (post && post.pending_payout_value && post.last_payout === '1970-01-01T00:00:00') {

      //value.total_payout_value.split(" ")[0])+parseFloat(value.total_pending_payout_value.split(" ")[0])
      //return (parseFloat(value.pending_payout_value.split(" ")[0])*rate);
      return post.total_payout_value ? ((parseFloat(post.total_payout_value.split(" ")[0])) + (parseFloat(post.pending_payout_value.split(" ")[0])) * rate).toFixed(2) : 0;
    } else {
      return post.total_payout_value ? ((parseFloat(post.total_payout_value.split(" ")[0])) + (parseFloat(post.curator_payout_value.split(" ")[0])) * rate).toFixed(2) : 0;
    }
  };
}
