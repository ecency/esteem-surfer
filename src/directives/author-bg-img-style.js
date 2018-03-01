export default () => {
  return (scope, element, attrs) => {
    attrs.$observe('author', (value) => {
      if (value === '') {
        return;
      }
      element.css({
        'background-image': 'url(https://steemitimages.com/u/' + value + '/avatar/medium)'
      });
    });
  };
}
