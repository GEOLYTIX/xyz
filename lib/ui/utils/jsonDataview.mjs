/**
## /ui/utils/jsonDataview

The jsonDataview module exports as default an object with a create method for JSON dataviews.

@module /ui/utils/jsonDataview
*/

export default {
  create
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
