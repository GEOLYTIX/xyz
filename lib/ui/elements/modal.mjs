export default (modal) => {

  // Ensure the target is an HTMLElement before proceeding
  if (!(modal.target instanceof HTMLElement)) return;

  const closeBtn = modal.close && mapp.utils.html.node`
    <button
      data-id=close
      class="mask-icon close"
      onclick=${closeModal}>`

  modal.data_id ??= 'modal'

  // Construct the modal element and append it to the target element
  modal.node = modal.target.appendChild(mapp.utils.html.node`
    <div 
      style=${modal.css_style}
      data-id=${modal.data_id}
      class="modal">
      ${closeBtn}
      ${modal.header}
      ${modal.content}`);

  if (modal.right) {

    // Calc left from right and offSetWidth
    modal.left = modal.target.offsetWidth - modal.node.offsetWidth - parseInt(modal.right)
  }
  
  modal.node.style.top = `${modal.top || 0}px`
  modal.node.style.left = `${modal.left || 0}px`

  modal.node.addEventListener('mousedown', handleStartEvent);
  modal.node.addEventListener('touchstart', handleStartEvent);      

  // Function to handle the modal closure
  function closeModal(e) {
    e.target.closest('.modal').remove();
    params?.close?.(e);
  }

  // Function to handle the start of a drag event, setting up the necessary event listeners for moving and ending the drag
  function handleStartEvent(e) {

    // Don't trigger shift on right click
    if (e.which === 3) return;

    modal.node.style.cursor = 'grabbing';

    const eventsMap = {
      mousedown: {
        move: 'mousemove',
        end: 'mouseup'
      },
      touchstart: {
        move: 'touchmove',
        end: 'touchend'
      },
    };

    const { move: moveEvent, end: endEvent } = eventsMap[e.type];

    modal.target.addEventListener(moveEvent, shiftEvent);
    window.addEventListener(endEvent, stopShift);
  }

  // Function to end the drag event, resetting cursor style and removing the move and end event listeners
  function stopShift() {
    delete modal.x
    delete modal.y

    modal.node.style.cursor = 'grab';
    modal.target.removeEventListener('mousemove', shiftEvent);
    modal.target.removeEventListener('touchmove', shiftEvent);
    modal.target.removeEventListener('mouseup', stopShift);
    modal.target.removeEventListener('touchend', stopShift);
  }

  // Function to handle the move event during a drag, updating the position of the modal while keeping it within the window bounds
  function shiftEvent(e) {

    // Set initial x
    modal.x ??= e.x

    const leftShift = e.x - modal.x

    modal.x = e.x

    // Set initial y
    modal.y ??= e.y

    const topShift = e.y - modal.y

    modal.y = e.y

    if (modal.contained) {

      shiftContained(leftShift, topShift)
      return;
    }

    if (modal.containedCentre) {

      shiftContainedCentre(leftShift, topShift)
      return
    }

    // left shift
    modal.node.style.left = `${modal.node.offsetLeft + leftShift}px`

    // top shift
    modal.node.style.top = `${modal.node.offsetTop + topShift}px`
  }

  function shiftContained(leftShift, topShift) {

    console.log([leftShift, topShift])

    // Exceeds left offset
    if ((modal.node.offsetLeft + leftShift) < 0) {

      modal.node.style.left = 0
    
    // Shifts left
    } else if (leftShift < 0) {

      modal.node.style.left = `${modal.node.offsetLeft + leftShift}px`

    // Does NOT exceed right offset
    } else if ((modal.target.offsetWidth - modal.node.offsetWidth - modal.node.offsetLeft) > 0) {

      // Shifts right
      modal.node.style.left = `${modal.node.offsetLeft + leftShift}px`
    }


    // Exceeds top offset
    if ((modal.node.offsetTop + topShift) < 0) {

      modal.node.style.top = 0
    
    // Shift top
    } else if (topShift < 0) {

      modal.node.style.top = `${modal.node.offsetTop + topShift}px`

    // Does NOT exceed bottom offset
    } else if ((modal.target.offsetHeight - modal.node.offsetHeight - modal.node.offsetTop) > 0) {

      // Shift bottom
      modal.node.style.top = `${modal.node.offsetTop + topShift}px`
    }
  }

  function shiftContainedCentre(leftShift, topShift) {

    // Exceeds left offset
    if ((modal.node.offsetLeft + parseInt(modal.node.offsetWidth / 2) + leftShift) < 0) {

      return;

      // Shifts left
    } else if (leftShift < 0) {

      modal.node.style.left = `${modal.node.offsetLeft + leftShift}px`

      // Does NOT exceed right offset
    } else if ((modal.target.offsetWidth - parseInt(modal.node.offsetWidth / 2) - modal.node.offsetLeft) > 0) {

      // Shifts right
      modal.node.style.left = `${modal.node.offsetLeft + leftShift}px`
    }


    // Exceeds top offset
    if ((modal.node.offsetTop + parseInt(modal.node.offsetHeight / 2) + topShift) < 0) {

      return;

      // Shift top
    } else if (topShift < 0) {

      modal.node.style.top = `${modal.node.offsetTop + topShift}px`

      // Does NOT exceed bottom offset
    } else if ((modal.target.offsetHeight - parseInt(modal.node.offsetHeight / 2) - modal.node.offsetTop) > 0) {

      // Shift bottom
      modal.node.style.top = `${modal.node.offsetTop + topShift}px`
    }
  }
};