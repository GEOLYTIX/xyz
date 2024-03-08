export default entry => {

  entry.formatterParams ??= {}

  entry.formatterParams.options ??= {}

  // Assign user language as locale if nullish but not null.
  if (entry.formatterParams.locale !== null) {
    entry.formatterParams.locale ??= mapp.user.language;
  }
 
  if (entry.edit) {

    if (entry.edit.range) {
      return createSlider(entry);
    }

    if (entry.formatterParams.input) {
      return createFormatterNumberInput(entry);
    }

    return createNumberInput(entry);
  }

  if (entry.value === undefined || entry.value === null || isNaN(entry.value)) return;

  if (entry.type === 'integer') {

    entry.formatterParams.options.maximumFractionDigits = 0
  } else {

    // Set rounding to entry.round or 2 if not defined
    entry.formatterParams.options.maximumFractionDigits ??= entry.round || 2

    // If maximumFractionDigits is greater than 2, add minimumFractionDigits
    if (entry.formatterParams.options.maximumFractionDigits > 2) {
      // Add minimumFractionDigits if maximumFractionDigits is greater than 2
      entry.formatterParams.options.minimumFractionDigits ??= entry.formatterParams.options.maximumFractionDigits
    }
  }

  // If locale is defined, use toLocaleString
  let localeValue;
  if (entry.formatterParams.locale) {
    localeValue = parseFloat(entry.value).toLocaleString(entry.formatterParams.locale, entry.formatterParams.options)
  }
  // If no locale, parseFloat and use maximumFractionDigits to round
  else {
    localeValue = parseFloat(entry.value).toFixed(entry.formatterParams.options.maximumFractionDigits)
  }

  return mapp.utils.html.node`
  <div class="val" style=${entry.css_val}>
    ${entry.prefix}${localeValue}${entry.suffix}`;

}

function createSlider(entry) {
  return mapp.ui.elements.slider({
    min: entry.edit.range.min,
    max: entry.edit.range.max,
    val: entry.newValue || entry.value,
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
      value=${entry.newValue || entry.value}
      placeholder=${entry.edit.placeholder}
      onkeyup=${e => handleKeyUp(e, entry)}>`;
}

function createFormatterNumberInput(entry) {

  return mapp.utils.html.node`
    <input
      value=${mapp.ui.elements.numericFormatter(entry)}
      onFocus=${e => onFocus(e, entry)}
      onBlur=${e => onBlur(e, entry)}
      placeholder=${entry.edit.placeholder}
      onkeyup=${e => handleKeyUp(e, entry)}>`;
}

function onFocus(e, entry) {
  e.target.value = parseFloat(entry.newValue || entry.value)
  e.target.type = 'number';
}

function onBlur(e, entry) {
  e.target.type = '';
  e.target.value = mapp.ui.elements.numericFormatter(entry)
}

function handleKeyUp(e, entry) {

  if (entry.type === 'integer') {
    e.target.value = parseInt(e.target.value);
  }

  if (e.target.value === 0) {

    entry.newValue = 0;
  }
  else if (!e.target.value) {
    entry.newValue = null;
  }
  else {

    entry.newValue = e.target.value;
  }

  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', { detail: entry })
  );
}