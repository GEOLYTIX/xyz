/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

@requires /utils/textFile

@module /ui/utils/jsonDataview
*/

export default {
  create,
  toolbar: {
    jsonfile,
    csvupload,
    update,
  },
};

/**
@function create
@async

@description
The create [json] dataview method sets default props for the creation of a jsoneditor dataview element.

The setData method is assign to set the json content of the jsoneditor element.

The setData method will be called if data is provided with the dataview object.

@param {dataview} dataview Dataview object.
@property {object} dataview.data A JSON data object to be assigned as data to the Json dataview.
@property {object} dataview.props Custom properties for the jsoneditor element.
*/
async function create(dataview) {
  dataview.props ??= {
    mode: 'text',
    readOnly: true,
    mainMenuBar: false,
  };

  dataview.jsoneditor = await mapp.ui.elements.jsoneditor(dataview);

  dataview.setData = setData;

  if (dataview.data) {
    dataview.setData(dataview.data);
  }
}

/**
@function setData

@description
The [json] dataview setData method calls the set method of the dataview.jsoneditor control to set the data as json content.

@param {Object} data JSON data.
*/
function setData(data) {
  this.data = data;

  const content = {
    json: data,
  };

  this.jsoneditor.set(content);
}

/**
@function jsonfile
@description
The button method creates a button element. 

The button will call the textFile utility method to create a json file download.

@param {dataview} dataview Dataview object.

@returns {HTMLElement} Returns the button element.
*/
function jsonfile(dataview) {
  dataview.title ??= dataview.label || 'Unknown';

  const button = mapp.utils.html.node`<button onclick=${() => {
    const textFile = {
      filename: `${dataview.title}.json`,
      text: JSON.stringify(dataview.data, null, 2),
      type: 'application/json',
    };

    mapp.utils.textFile(textFile);
  }}>Download</button>`;

  return button;
}

function csvupload(dataview) {
  dataview.toolbar.csvupload.label ??= 'CSV Upload';

  dataview.toolbar.csvupload.input = mapp.utils.html.node`<input 
      type=file class="flat bold wide primary-colour"
      accept=".csv"
      onchange=${async (e) => {
        if (!e.target.files[0]) return;

        dataview.toolbar.csvupload.file = e.target.files[0];

        const uploaded = await mapp.utils.csvUpload(
          dataview.toolbar.csvupload.file,
          dataview.toolbar.csvupload,
        );

        dataview.setData(uploaded);
      }}>`;

  return dataview.toolbar.csvupload.input;
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
      title: 'Update Dataview',
      onClick: updateDataview,
    });

    items.push({
      type: 'button',
      className: 'material-symbols-outlined-important',
      text: 'data_object',
      title: 'Update Dataview',
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
