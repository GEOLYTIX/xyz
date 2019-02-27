// Create param string for XHR request.
export function paramString(param) {

  const arr = [];

  Object.keys(param).forEach(key => {
    if (param[key]
      && (param[key].length > 0 || typeof(param[key]) === 'number') || param[key] === true) {
      arr.push(encodeURI(key + '=' + param[key]));
    }
  });

  return arr.join('&');

}