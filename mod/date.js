module.exports = () => {

  const date = new Date();

  return `${date.getUTCFullYear()}`
    + `-${pad(date.getUTCMonth() + 1)}`
    + `-${pad(date.getUTCDate())}`
    + `T${pad(date.getUTCHours())}`
    + `:${pad(date.getUTCMinutes())}`
    + `:${pad(date.getUTCSeconds())}`;

  function pad(number) {
    if (number < 10) return '0' + number;
    return number;
  }

};