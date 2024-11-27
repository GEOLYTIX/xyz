/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

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

  this.target.textContent = JSON.stringify(data)
}

/**
 * @function button
 * @description
 * The button method creates a button element. 
 * The button element is appended to the toolbar node, and when clicked the mapp.ui.elements.alert is called with the dataview title.
 * @param {Object} toolbar Toolbar object.
 * 
 * @returns {HTMLElement} Returns the button element.
 */

function button(dataview) {

  const label = dataview.title || dataview.label || 'Unknown';

  const button = mapp.utils.html.node`<button onclick=${() => {
    mapp.ui.elements.alert({ title:'Dataview Pressed', text: `Dataview Pressed: ${label}` });
  }}>${label}</button>`

  return button;
}