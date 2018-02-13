export default () => {
  return (scope, elm, attr) => {
    let raw = elm[0];

    elm.bind('scroll', () => {
      if ((raw.scrollTop + raw.offsetHeight) + 100 >= raw.scrollHeight) {
        scope.$apply(attr.scrolledBottom);
      }
    });
  };
}
