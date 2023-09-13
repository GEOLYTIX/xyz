export default (params) => {
  // Ensure the target is an HTMLElement before proceeding
  if (!(params.target instanceof HTMLElement)) return;

  // Construct the modal element and append it to the target element
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
          onclick=${closeModal}>
      </div>
      ${params.content}`);

  // Function to handle the modal closure
  function closeModal(e) {
    e.target.closest('.modal').remove();
    params.close && params.close(e);
  }

  // Function to add event listeners for drag functionality
  function addEventListeners() {
      params.modal.addEventListener('mousedown', handleStartEvent);
      params.modal.addEventListener('touchstart', handleStartEvent);
  }

  // Function to handle the start of a drag event, setting up the necessary event listeners for moving and ending the drag
  function handleStartEvent(e) {
    e.preventDefault();
    params.modal.style.cursor = 'grabbing';
    
    const moveEvent = e.type === 'mousedown' ? 'mousemove' : 'touchmove';
    const endEvent = e.type === 'mousedown' ? 'mouseup' : 'touchend';
    
    window.addEventListener(moveEvent, shiftEvent);
    window.addEventListener(endEvent, stopShift);
  }

  // Function to end the drag event, resetting cursor style and removing the move and end event listeners
  function stopShift() {
    params.modal.style.cursor = 'grab';
    x = undefined;
    y = undefined;
    window.removeEventListener('mousemove', shiftEvent);
    window.removeEventListener('touchmove', shiftEvent);
    window.removeEventListener('mouseup', stopShift);
    window.removeEventListener('touchend', stopShift);
  }

  // Variables to hold the current position during a drag event
  let x, y;

  // Function to handle the move event during a drag, updating the position of the modal while keeping it within the window bounds
  function shiftEvent(e) {
    const pageX = (e.touches && e.touches[0].pageX) || e.pageX;
    const pageY = (e.touches && e.touches[0].pageY) || e.pageY;

    if (!x || !y) {
      x = pageX;
      y = pageY;
      return;
    }

    let newRight = parseInt(params.modal.style.right) + (x - pageX);
    let newTop = parseInt(params.modal.style.top) + (pageY - y);

    // Define the boundaries for the modal movement
    const minRight = 0;
    const maxRight = window.innerWidth - params.modal.offsetWidth - 10;
    const minTop = 0;
    const maxTop = window.innerHeight - params.modal.offsetHeight - 10;

    // Restrict the modal movement within the boundaries
    newRight = Math.min(Math.max(newRight, minRight), maxRight);
    newTop = Math.min(Math.max(newTop, minTop), maxTop);

    // Update the modal position
    params.modal.style.right = newRight + 'px';
    params.modal.style.top = newTop + 'px';

    // Update the current position for the next move event
    x = pageX;
    y = pageY;
  }

  // Initialize the event listeners when the module is executed
  addEventListeners();
};