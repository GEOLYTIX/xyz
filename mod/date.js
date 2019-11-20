module.exports = () => {

  const date = new Date();

  /*return `${date.getUTCFullYear()}`
    + `-${pad(date.getUTCMonth() + 1)}`
    + `-${pad(date.getUTCDate())}`
    + `T${pad(date.getUTCHours())}`
    + `:${pad(date.getUTCMinutes())}`
    + `:${pad(date.getUTCSeconds())}`;*/

  return `${date.getFullYear()}`
    + `-${pad(date.getMonth() + 1)}`
    + `-${pad(date.getDate())}`
    + `T${pad(date.getHours())}`
    + `:${pad(date.getMinutes())}`
    + `:${pad(date.getSeconds())}`;

  function pad(number) {
    if (number < 10) return '0' + number;
    return number;
  }

};