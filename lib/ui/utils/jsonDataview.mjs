/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

@requires /utils/textFile

@module /ui/utils/jsonDataview
*/

export default {
  create,
  toolbar: {
    button
  }
}

/**
@function create

@description
The create method for json dataviews assigns the setData method to the dataview object.

@param {dataview} dataview Dataview object.
*/
function create(dataview) {

  dataview.setData = setData
}

/**
@function setData

@description
The [json] dataview setData method sets the stringified JSON data as textcontent of the dataview.target element.

@param {Object} data JSON data.
*/
function setData(data) {

  this.data = data
  this.target.textContent = JSON.stringify(data)
}

/**
@function button
@description
The button method creates a button element. 
The button element is appended to the toolbar node, and when clicked the mapp.ui.elements.alert is called with the dataview title.

@param {dataview} dataview Dataview object.

@returns {HTMLElement} Returns the button element.
*/
function button(dataview) {

  dataview.title ??= dataview.label || 'Unknown';

  const button = mapp.utils.html.node`<button onclick=${() => {

    const textFile = {
      text: JSON.stringify(dataview.data, null, 2),
      type: 'application/json'
    }
  
    mapp.utils.textFile(textFile)

  }}>${dataview.title}</button>`

  return button;
}
