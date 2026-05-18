/**
## mapp.utils.hexa()

@module /utils/hexa
*/

export default (hex, transparency) => {
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
};
