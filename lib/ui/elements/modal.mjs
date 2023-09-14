export default (params) => {

  // Ensure the target is an HTMLElement before proceeding
  if (!(params.target instanceof HTMLElement)) return;

  // Construct the modal element and append it to the target element
  params.modal = params.target.appendChild(mapp.utils.html.node`
    <div 
      style="top: 10px; right: 10px; overflow: auto;"
      data-id=${params.data_id || 'modal'}
      class="modal"
      draggable="true">
      <div class="header bold">
        <span>${params.header}</span>
        <button
          data-id=close
          class="mask-icon close"
          onclick=${closeModal}>
      </div>
      ${params.content}`);

  //set the width and height of the modal from where it gets defined.    
  params.modal.style.width = params.width || '50%';
  params.modal.style.height = params.height || '50%';

  // Function to handle the modal closure
  function closeModal(e) {
    e.target.closest('.modal').remove();
    params.close?.(e);
  }

  // x,y starting position.
  let x, y;

  params.modal.addEventListener("dragstart", (e) => {

    // set x,y starting position.
    x = e.pageX;
    y = e.pageY;

    // set class for transparent styling.
    e.target.classList.add("dragging");
  });

  params.modal.addEventListener("dragend", (e) => {

    // apply difference to element right, top.
    e.target.style.right = parseInt(params.modal.style.right) - (e.pageX - x) + 'px';
    e.target.style.top = parseInt(params.modal.style.top) + (e.pageY - y) + 'px';

    const box = e.target.getBoundingClientRect()
    const halfWidth = parseInt(box.width/2)
    const halfHeight = parseInt(box.height/2)

    // Box is more than halfWidth to the left.
    if (box.left < -halfWidth) {
      e.target.style.right = (window.innerWidth || document.documentElement.clientWidth) - halfWidth + 'px';
    }

    // Box is more than halfHeight to the top.
    if (box.top < -halfHeight) {
      e.target.style.top = -halfHeight + 'px';
    }

    // Box is more than halfWidth to the right.
    if (box.right > halfWidth + (window.innerHeight || document.documentElement.clientHeight)) {
      e.target.style.right = -halfWidth + 'px';
    }

    // Box is more than halfHeight to the bottom.
    if (box.bottom > halfHeight + (window.innerHeight || document.documentElement.clientHeight)) {
      e.target.style.top = (window.innerHeight || document.documentElement.clientHeight) - halfHeight + 'px';
    }

    // remove class for transparent styling.
    e.target.classList.remove("dragging");
  });
};