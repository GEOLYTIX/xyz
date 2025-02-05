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
  },
};

/**
@function create

@description
The create method for json dataviews assigns the setData method to the dataview object.

@param {dataview} dataview Dataview object.
@property {object} dataview.data A JSON data object to be assigned as data to the Json dataview.
*/
function create(dataview) {
  dataview.setData = setData;

  if (dataview.data) {
    dataview.setData(dataview.data);
  }
}

/**
@function setData

@description
The [json] dataview setData method sets the stringified JSON data as textcontent of the dataview.target element.

@param {Object} data JSON data.
*/
async function setData(data) {
  this.data = data;
  //this.target.textContent = JSON.stringify(data);

  await mapp.ui.elements.jsoneditor(this);
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
      text: JSON.stringify(dataview.data, null, 2),
      type: 'application/json',
    };

    mapp.utils.textFile(textFile);
  }}>${dataview.title}</button>`;

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
