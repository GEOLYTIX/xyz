/**
## mapp.utils.hexa()

@module /utils/hexa
*/

/**
@function hexa

@description
Adds the transparency as alpha channel to a hex colour. The hex colour is returned unchanged if the transparency is not a number or the hex colour has another length than 4 or 7.

@param {string} hex A hex colour, eg. `#ff0000` or `#f00`.
@param {number} transparency The alpha value between 0 and 1.
@returns {string} The hex colour with alpha channel.
*/
export default function hexa(hex, transparency) {
  if (Number.isNaN(Number(transparency))) return hex;

  if (hex.length === 7)
    return (
      hex +
      ((transparency && Number.parseInt(transparency * 255).toString(16)) ||
        '00')
    );

  if (hex.length === 4)
    return hex + Number.parseInt(transparency * 15).toString(16);

  return hex;
}
