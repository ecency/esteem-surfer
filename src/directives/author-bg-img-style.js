export default () => {
  return (scope, element, attrs) => {
    attrs.$observe('author', (value) => {
      if (value === '') {
        return;
      }
      let size = attrs.size || 'medium';

      element.css({
        'background-image': 'url(https://steemitimages.com/u/' + value + '/avatar/' + size + ')'
      });
    });
  };
}
