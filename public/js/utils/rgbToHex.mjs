export function rgbToHex(color) {

  let hexDigits = new Array
  ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
    
  if (color.substr(0, 1) === '#') return color;
    
  color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  
  return '#' + hex(color[1]) + hex(color[2]) + hex(color[3]);
    
  function hex(x) {
    return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }
}