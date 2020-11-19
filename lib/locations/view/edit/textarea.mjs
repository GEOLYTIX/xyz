export default _xyz => entry => {

  return entry.val.appendChild(_xyz.utils.html.node`
    <textarea
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
      }, 100)}>
      ${entry.value || ''}`)

}