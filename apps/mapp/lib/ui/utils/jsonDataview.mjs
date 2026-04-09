/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

@requires /utils/textFile
@requires /utils/copyToClipboard

@module /ui/utils/jsonDataview
*/

export default {
  create,
  toolbar: {
    copyToClipboard,
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

/**
@function copyToClipboard
@description
Stringifies the dataview data and writes the data to the clipboard.

@param {dataview} dataview Dataview object.

@returns {HTMLElement} Returns the button element.
*/
function copyToClipboard(dataview) {
  const button = mapp.utils.html.node`<button onclick=${() => {
    const text = JSON.stringify(dataview.data, null, 2);

    mapp.utils.copyToClipboard(text);
  }}>Copy to Clipboard</button>`;

  return button;
}

/**
@function csvupload
@description
The toolbar method returns an file input element which accepts csv files.

The onchange event of the input element triggers the mapp.utils.csvUpload() method.

@param {dataview} dataview Dataview object.

@returns {HTMLElement} Returns the button element.
*/
function csvupload(dataview) {
  dataview.toolbar.csvupload.label ??= 'CSV Upload';

  dataview.toolbar.csvupload.input = mapp.utils.html.node`<input 
      type=file class="flat bold wide"
      accept=".csv"
      onchange=${async (e) => {
        if (!e.target.files[0]) return;

        dataview.toolbar.csvupload.file = e.target.files[0];

        const response = await mapp.utils.csvUpload(
          dataview.toolbar.csvupload.file,
          dataview.toolbar.csvupload,
        );

        // Check if any of the uploaded results are errors.
        // This is required as response can be an array of results or a single result.
        // A single result may be returned as an error if missing queryparams.
        // A response of an array of results is returned if the csv upload is chunked into multiple requests.
        let errors;
        if (Array.isArray(response))
          errors = response.filter((result) => result instanceof Error);
        else if (response instanceof Error) errors = [response];

        // If there are errors, show an alert with all the error messages.
        if (errors?.length) {
          mapp.ui.elements.alert({
            title: 'CSV Upload',
            text: `Upload of CSV records has failed:\n\n${errors.map((err) => err.message).join('\n')}`,
          });
          return;
        }

        dataview.setData(response);
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
