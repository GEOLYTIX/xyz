export default (params) => {
  // Ensure the target is an HTMLElement before proceeding
  if (!params.target || !(params.target instanceof HTMLElement)) return;

  // Construct the modal element and append it to the target element
  params.modal = params.target.appendChild(mapp.utils.html.node`
    <div 
      style="top: 10px; right: 10px; overflow: auto;"
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

  //set the width and height of the modal from where it gets defined.    
  const { width = '50%', height = '50%' } = params;
  params.modal.style = { ...params.modal.style, width, height };

  // Function to handle the modal closure
  function closeModal(e) {
    e.target.closest('.modal').remove();
    params?.close?.(e);
  }

  // Function to add event listeners for drag functionality
  function addEventListeners() {
    params.modal.addEventListener('mousedown', handleStartEvent);
    params.modal.addEventListener('touchstart', handleStartEvent);
  }

  // Function to handle the start of a drag event, setting up the necessary event listeners for moving and ending the drag
  function handleStartEvent(e) {

    if (e.target.matches('input, textarea')) return;

    params.modal.style.cursor = 'grabbing';

    const eventsMap = {
      mousedown: { move: 'mousemove', end: 'mouseup' },
      touchstart: { move: 'touchmove', end: 'touchend' },
    };

    const { move: moveEvent, end: endEvent } = eventsMap[e.type];

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
    // Retrieve the current touch or mouse position
    const pageX = (e.touches && e.touches[0].pageX) || e.pageX;
    const pageY = (e.touches && e.touches[0].pageY) || e.pageY;

    // If x and y are not defined, it is the first move event; store the current positions and exit
    if (!x || !y) {
      x = pageX;
      y = pageY;
      return;
    }

    // Calculate the new position of the modal based on the drag distance
    let newRight = parseInt(params.modal.style.right) + (x - pageX);
    let newTop = parseInt(params.modal.style.top) + (pageY - y);

    // Retrieve the dimensions of the entire HTML page
    const targetBounds = document.documentElement.getBoundingClientRect();

    // Calculate the central anchor point of the modal (center in X and Y coordinates)
    const modalCenterX = window.innerWidth - newRight - (params.modal.offsetWidth / 2);
    const modalCenterY = newTop + (params.modal.offsetHeight / 2);

    // If the central anchor point of the modal goes outside the HTML page's boundaries, prevent the move
    if (
      modalCenterX < targetBounds.left ||
      modalCenterX > targetBounds.right ||
      modalCenterY < targetBounds.top ||
      modalCenterY > targetBounds.bottom
    ) {
      return;
    }

    // If within boundaries, update the modal's position based on the drag
    params.modal.style.right = newRight + 'px';
    params.modal.style.top = newTop + 'px';

    // Store the current positions for use in the next move event
    x = pageX;
    y = pageY;
  }

  // Initialize the event listeners when the module is executed
  addEventListeners();
};