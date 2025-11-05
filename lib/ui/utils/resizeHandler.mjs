/**
## ui/utils/resizeHandler

The resizeHandler module exports the resizeHandler function .

The resizeHandler orchestrates how the view reqcts when a resize element is used.

@module /ui/utils/resizeHandler
*/

//This will be used on doubleClickClose to set the view back to a default size.
const defaultGrids = {};

//Setup default minimum sizes
//And name the different css properties required to resize on a given axis.
//Resizing a height requires gridTemplateRows, whereas width requires gridTemplateColumns.
const page = {
  X: {
    min: 75,
    lockSize: 200,
    grid: 'gridTemplateColumns',
  },
  Y: {
    min: 0,
    lockSize: 50,
    grid: 'gridTemplateRows',
  },
  gridTemplate: {
    X: 'auto',
    Z: '10px',
    Y: 'auto',
  },
};

/**
@function resizeEventHandler

@description
The resizeHandler adds event listeners for mouseup/down and mousemouce events to perform the resizing of affected panels.

@param {Object} params Configuration options for the resizeHandler.
@property {function} params.resizeEvent The function that dictates what happens during resizing.
@property {HTMLElement} params.target the resize element.
@property {string} [params.axis=X] The axis along which the resizing is to occur.
@property {boolean} [params.doubleClickClose] Whether double clicking the handler collapses the panel.
*/
export default function resizeHandler(params) {
  //Bind the params to the functions so they can be referenced within.
  params.resizeEvent ??= resizeEventHandler.bind(params);
  params.stopResize = stopResize.bind(params);
  params.axis ??= 'X';

  if (params.doubleClickClose)
    params.target.ondblclick = (e) => collapseTarget(e, params);

  params.target.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    globalThis.addEventListener('mousemove', params.resizeEvent);
    globalThis.addEventListener('mouseup', params.stopResize);
  });

  params.target.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      globalThis.addEventListener('touchmove', params.resizeEvent);
      globalThis.addEventListener('touchend', params.stopResize);
    },
    {
      passive: true,
    },
  );

  //determine starting sizes of the view.
  //These are used to revert to a default on double click close.
  defaultGrids.gridTemplateColumns = getComputedStyle(
    document.body,
  ).gridTemplateColumns;

  defaultGrids.gridTemplateRows = getComputedStyle(
    document.body,
  ).gridTemplateRows;
}

/**
@function resizeEventHandler

@description
Resizes elements attached to the resize handler by adjusting the grid template attributes of the document body.

@param {event} e The resize event.
*/
function resizeEventHandler(e) {
  const axis = this.axis;

  //Determine the height and with of the attached elements.
  page.X.size = e.touches?.[0]?.pageX || e.pageX;
  page.Y.size = globalThis.innerHeight - (e.touches?.[0]?.pageY || e.pageY);

  const pageAxis = page[axis];

  //If the size of the container is below a defined minimum, hide the container
  //By setting the relevant grid template variable to 0px.
  if (pageAxis.size < pageAxis.min) {
    page.gridTemplate[axis] = '0px';
    document.body.style[pageAxis.grid] = Object.values(page.gridTemplate).join(
      ' ',
    );
    return;
  }

  //If the size is below the locksize return.
  //This is the minimum height or width of the element.
  if (pageAxis.size < pageAxis.lockSize) {
    return;
  }

  // Half width snap.
  if (axis === 'X') {
    if (page.X.size > globalThis.innerWidth / 2)
      page.X.size = globalThis.innerWidth / 2;
  }

  // Keep the height within 10 of the window height.
  if (axis === 'Y') {
    if (page.Y.size > globalThis.innerHeight - 10)
      page.Y.size = globalThis.innerHeight;

    OL.style.marginTop = `-${page.Y.size / 2}px`;
  }

  page.gridTemplate[axis] = `${pageAxis.size}px`;

  //Set the gridTemplateColumns/Rows to the new size.
  document.body.style[pageAxis.grid] = Object.values(page.gridTemplate).join(
    ' ',
  );

  //Reset the grid template variables.
  page.gridTemplate = {
    X: 'auto',
    Z: '10px',
    Y: 'auto',
  };
}

/**
@function collapseTarget

@description
Reduces the size of the target to 0 if it is expanded or sets the target to a calculated default if it is collapsed.

@param {event} e The resize event.
@param {Object} params Configuration for the resizeHandler.
@property {string} params.axis The axis along which the element should be adjusted.
*/
function collapseTarget(e, params) {
  //Determine the height and width of the container
  page.X.size = e.touches?.[0]?.pageX || e.pageX;
  page.Y.size = globalThis.innerHeight - (e.touches?.[0]?.pageY || e.pageY);

  //If the height is below the minimum, restore it to the default.
  if (page[params.axis].size < page[params.axis].min) {
    document.body.style[page[params.axis].grid] =
      defaultGrids[page[params.axis].grid];

    return;
  }

  //Hide the element by setting the relevant param to 0px.
  page.gridTemplate[params.axis] = '0px';

  document.body.style[page[params.axis].grid] = Object.values(
    page.gridTemplate,
  ).join(' ');

  //Restote gridTemplate defaults
  page.gridTemplate = {
    X: 'auto',
    Z: '10px',
    Y: 'auto',
  };
}

/** Remove resize events.
@function stopResize
Removes resizing Events and restores the cursor
*/
function stopResize() {
  //Restore the cursor and remove event listeners.
  document.body.style.cursor = 'auto';
  globalThis.removeEventListener('mousemove', this.resizeEvent);
  globalThis.removeEventListener('touchmove', this.resizeEvent);
  globalThis.removeEventListener('mouseup', this.stopResize);
  globalThis.removeEventListener('touchend', this.stopResize);
}
