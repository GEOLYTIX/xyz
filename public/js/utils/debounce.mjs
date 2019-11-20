// Debounce function.
export function debounce(func, wait) {

  let timeout;

  return function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

      timeout = null;
      func.apply(this, arguments);

    }, wait);
  };

}