export default (entry) => {
  let val;

  let stringVal = entry.value?.toString().replace('.', ':');

  stringVal =
    (stringVal && stringVal.length < 3 && `${stringVal}:00`) || stringVal;

  if (entry.edit) {
    val = mapp.utils.html.node`
      <input
        type="time"
        value=${stringVal}
        onchange=${(e) => {
          entry.newValue = parseFloat(e.target.value.replace(':', '.'));

          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry,
            }),
          );
        }}>`;
  } else {
    val = stringVal;
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`;

  return node;
};
