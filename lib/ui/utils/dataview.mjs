const dataview = {
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

  // A custome toolbar method has been assigned to the dataview.
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

function update(dataview) {
  if (dataview.toolbar.update === true) {
    dataview.toolbar.update = {};
  }

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

async function updateDialog(dataview) {
  const content = mapp.utils.html.node`<div>`;

  const jsonContent = {
    query: dataview.query,
    queryparams: dataview.queryparams,
    data: dataview.data,
  };

  const jsoneditor = await mapp.ui.elements.jsoneditor({
    target: content,
    props: {
      content: {
        text: JSON.stringify(jsonContent),
      },
      mode: 'text',
      onRenderMenu: renderUpdateMenu,
    },
  });

  dataview.toolbar.update.dialog = {
    header: 'Dataview Update',
    content,
    target: document.getElementById('Map'),
    closeBtn: true,
    onClose: (e) => {
      dataview.toolbar.update.button.classList.remove('active');
    },
  };

  mapp.ui.elements.dialog(dataview.toolbar.update.dialog);

  // Create a custom menu for the userLayer jsoneditor control.
  function renderUpdateMenu(items) {
    // Push button to add layer to mapview layers.
    items.push({
      type: 'button',
      className: 'material-symbols-outlined-important',
      text: 'sync',
      title: 'Update Dataview Query',
      onClick: updateDataview,
    });

    items.push({
      type: 'button',
      className: 'material-symbols-outlined-important',
      text: 'data_object',
      title: 'Set Dataview Data',
      onClick: setDataview,
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
