export default (entry) => {
  let val = mapp.utils.html`
    <pre><code>${JSON.stringify(entry.value, null, 2)}`;

  if (entry.edit) {
    val = mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      onfocus=${(e) => {
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
      onfocusout=${(e) => {
        e.target.style.height = 'auto';
      }}
      oninput=${(e) => {
        entry.json = (() => {
          try {
            return JSON.parse(e.target.value);
          } catch (e) {
            return false;
          }
        })();

        e.target.style.border = entry.json ? 'none' : '1px solid red';
      }}
      onkeyup=${(e) => {
        entry.newValue =
          typeof entry.json !== 'object' ? entry.value : entry.json;
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
        }, 100)}>${JSON.stringify(entry.value, null, 2)}`;
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">${val}`;

  return node;
};
