/**
### mapp.ui.elements.dataviewDialog()

Exports the dialog method as mapp.ui.elements.dataviewDialog()

@module /ui/elements/dataviewDialog
@requires /ui/elements/dialog
*/

/**
@function dataviewDialog

@description
Creates a dialog which can hold dataviews: charts and tables. 

The dialog is resizable and allows for a width and height param config.

Assigns a `dataview_dialog` object to the dataview which holds the created dialog.

```
{
  "target": "dialog"
  "dialog_css": {
    "width": 300,
    "height": 400,
    "minHeight": 350,
    "minWidth": 250,
  }
  ...
}

@param {Object} dataview The dialog configuration object.
@property {HTMLElement} dataview.chkbox Checkbox that controls whether the dataview is displayed or not. 
@property {String} dataview.key Key identifier of the chart/table. 
@property {String} dataview.label Label to be used as the dialog header. 
@property {Object} [dataview.dialog_css] An object with and a height and a width.
*/
export default function dataviewDialog(dataview) {
  if (dataview.target !== 'dialog') return;

  dataview.dataview_dialog = {};

  const dialog_style = `
    width: ${dataview.dialog_css?.width || '300'}px;
    height: ${dataview.dialog_css?.height || '300'}px;
    min-width: ${dataview.dialog_css?.minWidth || '300'}px;
    min-height: ${dataview.dialog_css?.minHeight || '300'}px;
    resize: both; overflow: scroll !important`;

  Object.assign(dataview.dataview_dialog, {
    header: mapp.utils.html.node`<h1> ${dataview.label}`,
    data_id: `${dataview.key}-dataviews-dialog`,
    target: document.getElementById('Map'),
    height: 'auto',
    left: '5%',
    top: '0.5em',
    class: 'box-shadow tabview',
    css_style: dialog_style,
    containedCentre: true,
    contained: true,
    headerDrag: true,
    closeBtn: true,
    onClose: () => {
      if (dataview.chkbox)
        dataview.chkbox.querySelector('input').checked = false;
    },
  });

  mapp.ui.elements.dialog(dataview.dataview_dialog);

  //Mimic the css of the tabview to get similar user experience.
  const content_panel = dataview.dataview_dialog.node.querySelector('.content');

  content_panel.classList.add('panel');

  dataview.target = content_panel;

  //Close the dialog at first
  dataview.dataview_dialog.dialog.close();

  dataview.show = () => {
    //Update the datview to show the data
    dataview.update();

    //Display the toolbar if there is one
    // The panel is not shown by default
    dataview.toolbar &&
      dataview.dataview_dialog.node
        .querySelector('.btn-row')
        .style.removeProperty('display');

    //Charts need to be direct children of the dialog so they can be resized,
    //when the dialog is resized.
    if (dataview.chart) {
      dataview.dataview_dialog.node.appendChild(
        dataview.target.querySelector('canvas'),
      );

      dataview.dataview_dialog.node.removeChild(dataview.target);
    }

    dataview.dataview_dialog.dialog.show();
  };

  dataview.hide = () => {
    dataview.dataview_dialog.dialog.close();
  };

  //Close the dialog if the location is removed.
  dataview.location?.removeCallbacks?.push?.(() =>
    dataview.dataview_dialog.dialog.close(),
  );
}
