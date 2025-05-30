/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

@requires /utils/textFile

@module /ui/utils/jsonDataview
*/

export default {
  create,
  toolbar: {
    csvupload,
    jsonfile,
    sqlinsert,
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
    mainMenuBar: false,
    mode: 'text',
    readOnly: true,
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
      type=file class="flat bold wide"
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

/**
@function sqlinsert
@description
The sqlinsert toolbar function makes the JSONEditor writable. The text content will be passed as POST body to the query defined in the sqlinsert configuration.

```json
"toolbar": {
  "sqlinsert": {
    "layer_template": "scratch",
    "template": "sql_table_insert",
    "table": "sql_insert"
  }
}
```

The default sql_table_insert query module can be used to securely load a JSON body into a SQL table.

@param {dataview} dataview Dataview object.

@returns {HTMLElement} Returns the button element.
*/
function sqlinsert(dataview) {
  dataview.props = {
    mainMenuBar: false,
    mode: 'text',
  };

  const button = mapp.utils.html.node`<button onclick=${() => {
    const content = dataview.jsoneditor.get();

    // The jsoneditor is empty.
    if (content.text === '') return;

    const paramString = mapp.utils.paramString(dataview.toolbar.sqlinsert);

    const url = `${mapp.host}/api/query?${paramString}`;

    return mapp.utils.xhr({
      body: content.text,
      method: 'POST',
      url,
    });
  }}>SQL Insert</button>`;

  return button;
}
