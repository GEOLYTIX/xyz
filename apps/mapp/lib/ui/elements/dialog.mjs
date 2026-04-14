/**
### mapp.ui.elements.dialog()

Exports the dialog method as mapp.ui.elements.dialog()

@module /ui/elements/dialog
*/

/**
@function dialog

@description
The dialog method decorates a dialog object with methods to close or shift the element within the confines of the containing [target] window element.

```js
const dialog = mapp.ui.elements.dialog({
  target: document.body,
  css_style: 'width: 300px; height: 200px; background: #fff; border: 1px solid #000',
  header: 'Dialog Header',
  content: 'Dialog Content',
  close: true,
  headerDrag: true
});
```

The show method will be called on an existing dialog unless the creation is implicit with the new property flag.

@param {Object} dialog The dialog configuration object.
@property {HTMLElement} dialog.target The target element where the dialog will be appended.
@property {string} [dialog.css_style] The CSS styles to apply to the dialog dialog.
@property {string} [dialog.data_id='dialog'] The data-id attribute value for the dialog.
@property {string} [dialog.header] The HTML content for the dialog header.
@property {string} [dialog.content] The HTML content for the dialog body.
@property {boolean} [dialog.modal] A flag to determine if its a Modal or Dialog.
@property {boolean} [dialog.closeBtn] The flag property will become the closeBtn element.
@property {boolean} [dialog.minimizeBtn] The flag property will become the minimizeBtn element.
@property {Function} [dialog.close] A function called by default when the dialog is closed. The dialog element is closed and removed from DOM.
@property {Function} [dialog.onClose] Optional function to run after dialog element is closed - uses onclose dialog event and overrides dialog.close().
@property {boolean} [dialog.new] Optional parameter which specifies whether a new dialog should be created on re-opening the dialog.
@property {number} [dialog.top] The top position of the dialog.
@property {number} [dialog.left] The left position of the dialog.
@property {number} [dialog.right] The right position of the dialog (used to calculate left position).
@property {boolean} [dialog.contained] A flag indicating whether to keep the dialog within the target element's boundaries.
@property {boolean} [dialog.containedCentre] A flag indicating whether to keep the dialog centered within the target element's boundaries.
@property {boolean} [dialog.headerDrag] A flag indicating whether the dialog can be dragged only by the header.By default, the dialog can be dragged from anywhere.
@returns {Object} Decorated dialog configuration object
*/

export default function dialog(dialog) {
  // Shortcircuit method and show existing dialog.
  // The new flag can be used to always create a new dialog.
  if (!dialog.new && typeof dialog.show === 'function') {
    dialog.show();
    return;
  }

  dialog.show = show;

  if (!dialog.target) {
    // The dialog must be modal if no target is provided.
    dialog.modal = true;

    // Ensure the target is an HTMLElement before proceeding
  } else if (!(dialog.target instanceof HTMLElement)) return;
  else dialog.show = show;

  // Close existing modal.
  document.querySelector('dialog.modal')?.close();

  dialog.minimizeBtn &&= mapp.utils.html`<button
    data-id="minimize"
    class="minimize-btn notranslate material-symbols-outlined"
    onclick=${(e) => {
      e.target.closest('dialog').classList.toggle('minimized');
    }}>`;

  function closeDialog(e) {
    if (dialog.onClose instanceof Function) {
      dialog.onClose(e);
    }
    dialog.node.remove();
  }

  dialog.close = closeDialog;

  dialog.closeBtn &&= mapp.utils.html`<button
    data-id=close
    class="notranslate material-symbols-outlined close"
    onclick=${closeDialog}>`;

  dialog.header =
    dialog.header instanceof HTMLElement
      ? dialog.header
      : mapp.utils.html`<h2>${dialog.header}`;

  dialog.headerHtml = mapp.utils.html`<header
    class=${dialog.headerDrag ? 'headerDrag' : ''}>
    ${dialog.header}${dialog.minimizeBtn}${dialog.closeBtn}`;

  dialog.data_id ??= 'dialog';

  dialog.class ??= 'box-shadow';
  dialog.class += dialog.modal ? ' modal' : ' dialog';

  dialog.node = mapp.utils.html.node`<dialog 
    onclose=${closeDialog}
    style=${dialog.css_style}
    data-id=${dialog.data_id}
    class=${dialog.class}>
    ${dialog.headerHtml}
    <div class="content">${dialog.content}`;

  if (dialog.modal) {
    document.body.append(dialog.node);
    dialog.node.showModal();
  } else {
    dialog.target.appendChild(dialog.node);
    dialog.node.show();

    if (dialog.right) {
      // Calc left from right and offSetWidth
      dialog.left =
        dialog.target.offsetWidth -
        dialog.node.offsetWidth -
        parseInt(dialog.right);
    }

    dialog.node.style.top = `${dialog.top || 0}`;
    dialog.node.style.left = `${dialog.left || 0}`;

    dialog.node.addEventListener('mousedown', handleStartEvent);
    dialog.node.addEventListener('touchstart', handleStartEvent);

    // Create a ResizeObserver to observe changes in the map's dimensions
    const resizeObserver = new ResizeObserver(adjustDialogPosition);
    resizeObserver.observe(dialog.target);
  }

  // Function to handle the start of a drag event, setting up the necessary event listeners for moving and ending the drag
  function handleStartEvent(e) {
    // If headerDrag is true, the dialog can only be dragged by the header
    if (dialog.headerDrag && !e.target.closest('header')) return;

    // Don't trigger shift on right click
    if (e.which === 3) return;

    dialog.node.style.cursor = 'grabbing';

    const eventsMap = {
      mousedown: {
        end: 'mouseup',
        move: 'mousemove',
      },
      touchstart: {
        end: 'touchend',
        move: 'touchmove',
      },
    };

    const { move: moveEvent, end: endEvent } = eventsMap[e.type];

    dialog.target.addEventListener(moveEvent, shiftEvent);
    window.addEventListener(endEvent, stopShift);
  }

  function adjustDialogPosition() {
    const { offsetWidth: mapWidth, offsetHeight: mapHeight } = dialog.target;
    const { offsetWidth: dialogWidth, offsetHeight: dialogHeight } =
      dialog.node;

    // Calculate the maximum allowed positions for the dialog
    // Prevent negative left and top values
    const maxLeft = mapWidth - dialogWidth < 0 ? 0 : mapWidth - dialogWidth;
    const maxTop = mapHeight - dialogHeight < 0 ? 0 : mapHeight - dialogHeight;

    // Adjust the dialog's position if it exceeds the map boundaries
    dialog.node.style.left = `${Math.min(Math.max(dialog.node.offsetLeft, 0), maxLeft)}px`;
    dialog.node.style.top = `${Math.min(Math.max(dialog.node.offsetTop, 0), maxTop)}px`;
  }

  // Function to end the drag event, resetting cursor style and removing the move and end event listeners
  function stopShift() {
    delete dialog.x;
    delete dialog.y;

    // If headerDrag is true - the cursor should be set to auto on mouseup
    dialog.node.style.cursor = dialog.headerDrag ? 'auto' : 'grab';

    dialog.target.removeEventListener('mousemove', shiftEvent);
    dialog.target.removeEventListener('touchmove', shiftEvent);
    dialog.target.removeEventListener('mouseup', stopShift);
    dialog.target.removeEventListener('touchend', stopShift);
  }

  // Function to handle the move event during a drag, updating the position of the dialog while keeping it within the window bounds
  function shiftEvent(e) {
    // Set initial x
    dialog.x ??= e.x;

    const leftShift = e.x - dialog.x;

    dialog.x = e.x;

    // Set initial y
    dialog.y ??= e.y;

    const topShift = e.y - dialog.y;

    dialog.y = e.y;

    if (dialog.contained && !dialog.modal) {
      shiftContained(dialog, leftShift, topShift);
      return;
    }

    if (dialog.containedCentre && !dialog.modal) {
      shiftContainedCentre(dialog, leftShift, topShift);
      return;
    }

    // left shift
    dialog.node.style.left = `${dialog.node.offsetLeft + leftShift}px`;

    // top shift
    dialog.node.style.top = `${dialog.node.offsetTop + topShift}px`;
  }

  // Maintain a reference to the dialog
  dialog.dialog = dialog;

  return dialog;
}

/**
@function shiftContained

@description
The shiftContained method prevents the dialog element to be shifted beyond the extent of the containing window element.

@param {Object} dialog
The dialog configuration object.
@param {integer} leftShift
Shift from left offset.
@param {integer} topShift
Shift from top offset
*/

function shiftContained(dialog, leftShift, topShift) {
  // Exceeds left offset
  if (dialog.node.offsetLeft + leftShift < 0) {
    dialog.node.style.left = 0;

    // Shifts left
  } else if (leftShift < 0) {
    dialog.node.style.left = `${dialog.node.offsetLeft + leftShift}px`;

    // Does NOT exceed right offset
  } else if (
    dialog.target.offsetWidth -
      dialog.node.offsetWidth -
      dialog.node.offsetLeft >
    0
  ) {
    // Shifts right
    dialog.node.style.left = `${dialog.node.offsetLeft + leftShift}px`;
  }

  // Exceeds top offset
  if (dialog.node.offsetTop + topShift < 0) {
    dialog.node.style.top = 0;

    // Shift top
  } else if (topShift < 0) {
    dialog.node.style.top = `${dialog.node.offsetTop + topShift}px`;

    // Does NOT exceed bottom offset
  } else if (
    dialog.target.offsetHeight -
      dialog.node.offsetHeight -
      dialog.node.offsetTop >
    0
  ) {
    // Shift bottom
    dialog.node.style.top = `${dialog.node.offsetTop + topShift}px`;
  }
}

/**
@function shiftContainedCentre

@description
The shiftContainedCentre method prevents the dialog elements calculated centre to be shifted beyond the extent of the containing window element.

@param {Object} dialog
The dialog configuration object.
@param {integer} leftShift
Shift from left offset.
@param {integer} topShift
Shift from top offset
*/

function shiftContainedCentre(dialog, leftShift, topShift) {
  // Exceeds left offset
  if (
    dialog.node.offsetLeft + parseInt(dialog.node.offsetWidth / 2) + leftShift <
    0
  ) {
    return;

    // Shifts left
  } else if (leftShift < 0) {
    dialog.node.style.left = `${dialog.node.offsetLeft + leftShift}px`;

    // Does NOT exceed right offset
  } else if (
    dialog.target.offsetWidth -
      parseInt(dialog.node.offsetWidth / 2) -
      dialog.node.offsetLeft >
    0
  ) {
    // Shifts right
    dialog.node.style.left = `${dialog.node.offsetLeft + leftShift}px`;
  }

  // Exceeds top offset
  if (
    dialog.node.offsetTop + parseInt(dialog.node.offsetHeight / 2) + topShift <
    0
  ) {
    return;

    // Shift top
  } else if (topShift < 0) {
    dialog.node.style.top = `${dialog.node.offsetTop + topShift}px`;

    // Does NOT exceed bottom offset
  } else if (
    dialog.target.offsetHeight -
      parseInt(dialog.node.offsetHeight / 2) -
      dialog.node.offsetTop >
    0
  ) {
    // Shift bottom
    dialog.node.style.top = `${dialog.node.offsetTop + topShift}px`;
  }
}

/**
@function show

@description
Appends the dialog node to its target. 
Called upon re-opening a dialog. 
*/
function show() {
  //check for a node
  if (!this.node) return;

  //append the node to the target if there is one
  this.target instanceof HTMLElement && this.target.append(this.node);
}
