/**
## ui/utils/resizeHandler

@module /ui/utils/resizeHandler
*/
const defaultGrids = {};

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

export default function resizeHandler(params) {
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

  defaultGrids.gridTemplateColumns = getComputedStyle(
    document.body,
  ).gridTemplateColumns;

  defaultGrids.gridTemplateRows = getComputedStyle(
    document.body,
  ).gridTemplateRows;
}

function resizeEventHandler(e) {
  const params = this;

  page.X.size = e.touches?.[0]?.pageX || e.pageX;
  page.Y.size = globalThis.innerHeight - (e.touches?.[0]?.pageY || e.pageY);

  const pageAxis = page[params.axis];

  if (pageAxis.size < pageAxis.min) {
    page.gridTemplate[params.axis] = '0px';
    document.body.style[pageAxis.grid] = Object.values(page.gridTemplate).join(
      ' ',
    );
    return;
  }

  if (pageAxis.size < pageAxis.lockSize) {
    return;
  }

  // Half width snap.
  if (params.axis === 'X') {
    if (page.X.size > globalThis.innerWidth / 2)
      page.X.size = globalThis.innerWidth / 2;
  }

  if (params.axis === 'Y') {
    if (page.Y.size > globalThis.innerHeight - 10)
      page.Y.size = globalThis.innerHeight;

    OL.style.marginTop = `-${page.Y.size / 2}px`;
  }

  page.gridTemplate[params.axis] = `${pageAxis.size}px`;

  document.body.style[pageAxis.grid] = Object.values(page.gridTemplate).join(
    ' ',
  );

  page.gridTemplate = {
    X: 'auto',
    Z: '10px',
    Y: 'auto',
  };
}

function collapseTarget(e, params) {
  //Collapse location view on double clicking the resizeHandler;
  page.X.size = e.touches?.[0]?.pageX || e.pageX;
  page.Y.size = globalThis.innerHeight - (e.touches?.[0]?.pageY || e.pageY);

  if (page[params.axis].size < page[params.axis].min) {
    document.body.style[page[params.axis].grid] =
      defaultGrids[page[params.axis].grid];

    return;
  }

  page.gridTemplate[params.axis] = '0px';

  document.body.style[page[params.axis].grid] = Object.values(
    page.gridTemplate,
  ).join(' ');

  page.gridTemplate = {
    X: 'auto',
    Z: '10px',
    Y: 'auto',
  };
}

// Remove vertical resize events.
function stopResize() {
  const params = this;

  document.body.style.cursor = 'auto';
  globalThis.removeEventListener('mousemove', params.resizeEvent);
  globalThis.removeEventListener('touchmove', params.resizeEvent);
  globalThis.removeEventListener('mouseup', params.stopResize);
  globalThis.removeEventListener('touchend', params.stopResize);
}
