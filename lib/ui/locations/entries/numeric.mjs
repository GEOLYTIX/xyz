export default entry => {

  formatEntryValue(entry);

  if (!entry.edit) {
    return displayValueNode(entry);
  }

  if (entry.edit.range) {
    return createSlider(entry);
  }

  return createNumberInput(entry);
}

function formatEntryValue(entry) {
  if (isNaN(entry.value)) return;

  if (entry.type === 'integer') {
  const options = {
    // Number of decimal places is always 0 for integers
    maximumFractionDigits: 0
  };
  entry.value = parseFloat(entry.value).toLocaleString('en-GB', options);
  } else {

    // Convert the value using toLocaleString with the formatterParams defined
    entry.value  =  parseFloat(entry.value).toLocaleString(entry?.formatterParams?.locale || 'en-GB', entry?.formatterParams?.options)
  }
}

function createSlider(entry) {
  return mapp.ui.elements.slider({
    min: entry.edit.range.min,
    max: entry.edit.range.max,
    val: entry.value,
    callback: e => {
      entry.newValue = entry.type === 'integer'
        ? parseInt(e.target.value)
        : parseFloat(e.target.value);

      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', { detail: entry })
      );
    }
  });
}

function createNumberInput(entry) {
  return mapp.utils.html.node`
    <input
      type="number"
      value=${entry.value}
      placeholder=${entry.edit.placeholder}
      onkeyup=${e => handleKeyUp(e, entry)}
    >`;
}

function handleKeyUp(e, entry) {
  if (entry.type === 'integer') {
    e.target.value = parseInt(e.target.value);
  }

  entry.newValue = e.target.value;
  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', { detail: entry })
  );
}

function displayValueNode(entry) {
  return mapp.utils.html.node`
    <div class="val" style=${entry.css_val}>
      ${entry.prefix}${entry.value}${entry.suffix}
    </div>`;
}