/**
## /ui/utils/dataview

The dataview ui utils provide access to a method which creates a toolbar for dataviews.

Toolbar method defined in the mapp.ui.utils.dataview.toolbar object are accessible for dataview types.

@requires /ui/elements/jsoneditor
@requires /ui/elements/dialog

@module /ui/utils/dataview
*/

const dataview = {
  mapChange,
  Toolbar,
  toolbar: {
    update,
  },
};

export default dataview;

/**
@function Toolbar

@description
The Toolbar method will create a HTML Element container with target elements for toolbar elements and the dataview itself.

@param {dataview} _this Dataview object.
@property {Object} _this.toolbar Configuration object for a toolbar supporting the dataview.
@property {string} _this.dataview The type of dataview
@property {HTMLElement} _this.target Target element in which the dataview is rendered.
@property {HTMLElement} [_this.panel] A panel element to be displayed in a tab[view].
*/
function Toolbar(_this) {
  // A toolbar config object is required.
  if (!_this.toolbar) return;

  // A custom toolbar method has been assigned to the dataview.
  if (typeof _this.toolbar === 'function') {
    _this.toolbar();
  }

  // Target for the dataview.
  const target = mapp.utils.html.node`<div class="dataview-target">`;

  // Find and execute matching toolbar methods.
  const toolbarElements = Object.keys(_this.toolbar)
    .map((key) => {
      if (Object.hasOwn(mapp.ui.utils.dataview.toolbar, key)) {
        return mapp.ui.utils.dataview.toolbar[key](_this);
      } else if (Object.hasOwn(mapp.ui.utils[_this.dataview]?.toolbar, key)) {
        return mapp.ui.utils[_this.dataview]?.toolbar[key]?.(_this);
      }
    })
    .filter((item) => !!item);

  // Create an element for the toolbar buttons
  _this.btnRow = mapp.utils.html
    .node`<div class="btn-row">${toolbarElements}</div>`;

  // By default btnRow is hidden
  _this.btnRow.style.setProperty('display', 'none');

  // The panel will be assigned in a tabview.
  _this.panel = _this.target.appendChild(mapp.utils.html.node`
      <div class="flex-col">
        ${_this.btnRow}
        ${target}`);

  // Assign dataview target as target.
  _this.target = target;
}

/**
@function mapChange

@description
The mapChange method assigns an event listener for the custom changeEnd event of the dataview.layer mapview.

The mapChange property can be a function which is executed if the 'changeEnd' event is triggered. 

Otherwise the dataview.update() method will be executed.

The event method will shortcircuit if the dataview object is tabview tab without the `.active` class.

@param {Object} _this Dataview object.
@property {Object} [_this.mapChange] A boolean flag or function.
@property {layer} _this.layer A layer associated with a dataview.
@property {mapview} layer.mapview The layer mapview.
*/
function mapChange(_this) {
  // The dataview should not update with a mapchange event.
  if (!_this.mapChange) return;

  _this.layer?.mapview?.Map.getTargetElement().addEventListener(
    'changeEnd',
    () => {
      // Only update dataview if corresponding layer is visible.
      if (!_this.layer.display) return;

      // Only update dataview in tab if active.
      if (_this.tab && !_this.tab.classList.contains('active')) return;

      // Execute mapChange if defined as custom function.
      if (typeof _this.mapChange === 'function') {
        _this.mapChange();
      } else {
        _this.update();
      }
    },
  );
}

/**
@function update

@description
The update [toolbar] method will return a button element for the dataview toolbar.

The button will toggle a dialog for dataview update.

@param {dataview} dataview Dataview object.
*/
function update(dataview) {
  dataview.toolbar.update.button = mapp.utils.html.node`<button 
    onclick=${() => {
      const toogle = dataview.toolbar.update.button.classList.toggle('active');
      if (toogle) {
        updateDialog(dataview);
      } else {
        dataview.toolbar.update.dialog.close();
      }
    }}>
    Update`;

  return dataview.toolbar.update.button;
}

/**
@function updateDialog

@description
The updateDialog method will present a jsonEditor element in a dialog.

The jsonEditor toolbar will provide methods to update the dataview or set the dataview data from the JSON content of the jsonEditor element.

@param {dataview} dataview Dataview object.
*/
async function updateDialog(dataview) {
  const content = mapp.utils.html.node`<div>`;

  const jsonContent = {
    data: dataview.data,
    query: dataview.query,
    queryparams: dataview.queryparams,
  };

  const jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      content: {
        text: JSON.stringify(jsonContent),
      },
      mode: 'text',
      onRenderMenu: renderUpdateMenu,
    },
    target: content,
  });

  dataview.toolbar.update.dialog = {
    closeBtn: true,
    content,
    header: 'Dataview Update',
    onClose: (e) => {
      dataview.toolbar.update.button.classList.remove('active');
    },
    target: document.getElementById('Map'),
  };

  mapp.ui.elements.dialog(dataview.toolbar.update.dialog);

  // Create a custom menu for the userLayer jsoneditor control.
  function renderUpdateMenu(items) {
    // Push button to add layer to mapview layers.
    items.push({
      className: 'notranslate material-symbols-outlined-important',
      onClick: updateDataview,
      text: 'sync',
      title: 'Update Dataview Query',
      type: 'button',
    });

    items.push({
      className: 'notranslate material-symbols-outlined-important',
      onClick: setDataview,
      text: 'data_object',
      title: 'Set Dataview Data',
      type: 'button',
    });

    return items
      .filter((item) => item.text !== 'table')
      .filter((item) => item.text !== 'tree')
      .filter((item) => item.type !== 'separator')
      .filter((item) => item.className !== 'jse-undo')
      .filter((item) => item.className !== 'jse-redo')
      .filter((item) => item.className !== 'jse-search')
      .filter((item) => item.className !== 'jse-contextmenu')
      .filter((item) => item.className !== 'jse-sort')
      .filter((item) => item.className !== 'jse-transform');
  }

  function updateDataview() {
    const content = jsoneditor.get();

    const json = JSON.parse(content.text);

    Object.assign(dataview, json);

    dataview.update();
  }

  function setDataview() {
    const content = jsoneditor.get();

    const json = JSON.parse(content.text);

    dataview.setData(json.data);
  }
}
