export default (hex, transparency) => {
  if (isNaN(transparency)) return hex;

  if (hex.length === 7) return hex + parseInt(transparency * 255).toString(16);

  if (hex.length === 4) return hex + parseInt(transparency * 15).toString(16);

  return hex;
}
