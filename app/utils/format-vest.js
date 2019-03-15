export default x =>
  typeof x === 'number'
    ? x
        .toLocaleString('en-US')
        .replace(/,/g, '-')
        .replace(/\./, ',')
        .replace(/-/g, '.')
    : x;
