export default ($rootScope, $filter, $sce) => {
  return (post) => {

    if(!post){
      return null;
    }

    const pendingPayout = (Number(post.pending_payout_value.split(' ')[0]) * $rootScope.currencyRate);
    const promotedPayout = (Number(post.promoted.split(' ')[0]) * $rootScope.currencyRate);
    const authorPayout = (Number(post.total_payout_value.split(' ')[0]) * $rootScope.currencyRate);
    const curationPayout = (Number(post.curator_payout_value.split(' ')[0]) * $rootScope.currencyRate);
    const payout = (post.last_payout === '1970-01-01T00:00:00' ? post.cashout_time : post.last_payout);

    const h = `
      <table class="table">
        <tbody>
          <tr>
            <th>${ $filter('translate')('POTENTIAL_PAYOUT') }</th>
            <td>${ $filter('currencySymbol')($rootScope.currency) + $filter('number')(pendingPayout, 3) }</td>
          </tr>
          <tr>
            <th>${ $filter('translate')('PROMOTED') }</th>
            <td>${ $filter('currencySymbol')($rootScope.currency) + $filter('number')(promotedPayout, 3) }</td>
          </tr>
          <tr>
            <th>${ $filter('translate')('AUTHOR_PAYOUT')  }</th>
            <td>${ $filter('currencySymbol')($rootScope.currency) + $filter('number')(authorPayout, 3) }</td>
          </tr>
          <tr>
            <th>${ $filter('translate')('CURATION_PAYOUT') }</th>
            <td>${ $filter('currencySymbol')($rootScope.currency) + $filter('number')(curationPayout, 3) }</td>
          </tr>
          <tr>
            <th>${ $filter('translate')('PAYOUT') }</th>
            <td>${ $filter('timeAgo')(payout, true) }</td>
          </tr>
        </tbody>
      </table>
      `;

    return $sce.trustAsHtml(h);
  };
}
