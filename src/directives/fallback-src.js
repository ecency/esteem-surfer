export default () => {
  return {
    link: function postLink(scope, element, attrs) {
      element.bind('error', function () {
        angular.element(this).attr('src', attrs.fallbackSrc).addClass('fallback-img');
      });
    }
  };
}
