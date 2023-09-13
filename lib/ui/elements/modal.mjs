export default (params) => {

  if (!(params.target instanceof HTMLElement)) return;

  params.modal = params.target.appendChild(mapp.utils.html.node`
    <div 
      style="top: 10px; right: 10px;"
      data-id=${params.data_id || 'modal'}
      class="modal">
      <div class="header bold">
        <span>${params.header}</span>
        <button
          data-id=close
          class="mask-icon close"
          onclick=${e => {
      e.target.closest('.modal').remove()
      params.close && params.close(e)
    }}>
      </div>
      ${params.content}`)

  params.modal.addEventListener('mousedown', (e) => {
    //checks whether the event target is a form element
    if (e.target.matches('input, select, textarea, button')) return;

    e.preventDefault();
    params.modal.style.cursor = 'grabbing';
    window.addEventListener('mousemove', shiftEvent);
    window.addEventListener('mouseup', stopShift);
  });

  params.modal.addEventListener('touchstart', (e) => {
    //checks whether the event target is a form element
    if (e.target.matches('input, select, textarea, button')) return;

    e.preventDefault();
    params.modal.style.cursor = 'grabbing';
    window.addEventListener('touchmove', shiftEvent);
    window.addEventListener('touchend', stopShift);
  }, {
    passive: true,
  });

  // Remove vertical resize events.
  function stopShift() {
    params.modal.style.cursor = 'grab';
    x = undefined;
    y = undefined;
    window.removeEventListener('mousemove', shiftEvent);
    window.removeEventListener('touchmove', shiftEvent);
    window.removeEventListener('mouseup', stopShift);
    window.removeEventListener('touchend', stopShift);
  }

  let x, y;

  function shiftEvent(e) {

    const pageX = (e.touches && e.touches[0].pageX) || e.pageX;

    const pageY = (e.touches && e.touches[0].pageY) || e.pageY;


    if (!x || !y) {
      x = pageX;
      y = pageY;
      return
    }

    params.modal.style.right = parseInt(params.modal.style.right) + (x - pageX) + 'px'
    params.modal.style.top = parseInt(params.modal.style.top) + (pageY - y) + 'px'

    x = pageX;
    y = pageY;
  }

}