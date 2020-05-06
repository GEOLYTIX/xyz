export default _xyz => entry => {

  let textArea = _xyz.utils.wire()`
  <textarea
    value=${entry.value || ''}
    style="auto; min-height: 50px;"
	  onfocus=${e => {
      e.target.style.height = e.target.scrollHeight + 'px';
    }}
	  onfocusout=${e => {
      e.target.style.height = 'auto';
    }}
	  onkeyup=${e => {
      entry.location.view.dispatchEvent(
        new CustomEvent('valChange', {
          detail: {
            input: e.target,
            entry: entry
          }
        }))
    }}
	  onkeydown=${e => setTimeout(() => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }, 100)}>`;

  entry.val.style.gridColumn = "1 / 3";

  entry.val.appendChild(textArea);

  return textArea;
}