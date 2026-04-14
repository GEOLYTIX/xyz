/**
## /utils/mobile

Export the mobile utility method.

@module /utils/mobile
*/

/**
@function mobile

@description
The mobile utility method can be used to set the widthInPx module variable or check whether the window.innerWidth is less or equal the widthInPx variable.

@param {integer} setWidthInPx Set widthInPx

@returns {Boolean} Returns true if window.innerWidth is less than widthInPx
*/

let widthInPx = 0;

export default function mobile(setWidthInPx) {
  if (!setWidthInPx) return window.innerWidth <= widthInPx;

  widthInPx = setWidthInPx;
}
