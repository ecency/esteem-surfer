export default strVal =>
  typeof strVal === 'string'
    ? Number(parseFloat(strVal.split(' ')[0]))
    : strVal;
