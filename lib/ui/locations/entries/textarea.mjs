export default (entry) => {
  let val = entry.type !== 'html' ? entry.value : '';

  if (entry.edit) {
    val = mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      maxlength=${entry.edit.maxlength}
      placeholder="${entry.edit.placeholder || ''}"
      onfocus=${(e) => {
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
      onfocusout=${(e) => {
        e.target.style.height = 'auto';
      }}
      onkeyup=${(e) => {
        entry.newValue = e.target.value;
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry,
          }),
        );
      }}
      onkeydown=${(e) =>
        setTimeout(() => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }, 100)}>
      ${entry.newValue || entry.value || ''}`;
  }

  entry.css_val ??= '';

  const node = mapp.utils.html.node`
  <div
    class="val"
    style="${entry.css_val}">${val}`;

  if (!entry.edit && entry.type === 'html') {
    node.innerHTML = entry.value || '';
  }

  return node;
};
