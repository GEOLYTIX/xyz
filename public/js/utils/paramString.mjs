// Create param string for XHR request.
export function paramString(param) {

  let encodedString = '';

  Object.keys(param).forEach(key => {
    if (param[key] && encodedString.length > 0) encodedString += '&';
    if (param[key]) encodedString += encodeURI(key + '=' + param[key]);
  });

  return encodedString;

}