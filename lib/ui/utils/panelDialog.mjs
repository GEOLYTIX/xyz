/**
## ui/utils/panelDialog

The panelDialog module exports the the panelDialog function which creates the button and the controlling function for
create dialogs for panel elements.

@requires /mapp/ui/elements/dialog
@module /ui/utils/panelDialog
*/

/**
@function panelDialog

@description
Creates the button for creating the dialog, which contains the content of the panel.

A paneltype object is used to identify the specific panel:
```JSON
{
  key: "draw",
  name: "Draw",
  icon: "new_label",
  setView: "view_id"
}
```
The icon should be the name of a material symbols icon.

The panel should specify `dialog: true` at minimum to get the dialog to create.

Several options can be specified in the dialog:
```JSON
dialog: {
  btn_title: "My panel Dialog",
  btn_label: "Open my panel dialog",
  title: "My dialog title"
}
```
@param {layer} layer The layer holding the configuration for the panel.
@property {String} layer.key The layers key
@property {Boolean} layer.display Whether the layer is showing or not.
@property {Array<Function>} layer.hideCallbacks The array of callback functions for when a layer is hidden.
@property {Array<Function>} [layer.showCallbacks] The array of callback functions for when a layer is shown.
@param {Object} panelType panel parameters for the dialog.
@property {String} panelType.key property name of the panel e.g. draw.
@property {String} panelType.name The name of the panel.
@property {string} panelType.icon The icon to be displayed on the panels button.
*/
export default function panelDialog(layer, panelType) {
  //identify the panel e.g. drawer or filter, etc.
  const panelParams = layer[panelType.key];

  if (!panelParams.dialog) return;

  if (panelParams.dialog === true) panelParams.dialog = {};

  //Prevent the drawer from being created.
  panelParams.drawer = false;

  panelParams.dialog.btn_title ??= `Open the ${panelType.key} dialog`;
  panelParams.dialog.btn_label ??= panelType.name;

  panelParams.dialog.btn = mapp.utils.html.node`<button
    class="wide flat action multi_hover"
    data-id=${panelType.data_id}
    title=${panelParams.dialog.btn_title}
    onclick=${() => {
      // classList.toggle resolves as true when the class is added.
      if (panelParams.dialog?.btn.classList.toggle('active')) {
        openDialog(layer, panelType);
      } else {
        // The decorated dialog object has a close method.
        panelParams.dialog.close();
      }
    }}>
    <span class="material-symbols-outlined notranslate">${panelType.icon}</span>
    ${panelParams.dialog.btn_label}`;

  //Show the dialog on layer display
  if (panelParams.dialog.showOnLayerDisplay) {
    layer.showCallbacks.push(() => {
      !panelParams.dialog?.btn.classList.contains('active') &&
        panelParams.dialog?.btn.dispatchEvent(new Event('click'));
      return layer;
    });

    layer.display && panelParams.dialog?.btn.dispatchEvent(new Event('click'));
  }

  //Hide the dialog when the layer is hidden
  layer.hideCallbacks?.push?.(() => {
    panelParams.dialog?.btn.classList.contains('active') &&
      panelParams.dialog?.btn.dispatchEvent(new Event('click'));
    return layer;
  });
}

/**
@function openDialog
@description
Instatiates the dialog for the panel, or if the dialog already exists calls the dialog show function.

@param {layer} layer The layer holding the configuration for the panel.
@property {String} layer.key The layers key
@param {Object} panelType panel parameters for the dialog.
@property {String} panelType.key property name of the panel e.g. draw.
@property {String} panelType.name The name of the panel.
*/
function openDialog(layer, panelType) {
  const panelParams = layer[panelType.key];

  layer.show();

  if (panelParams.dialog.show) return panelParams.dialog.show();

  panelParams.dialog.title ??= `${panelType.name} Dialog`;

  panelParams.dialog.header = mapp.utils.html`
    <h1>${panelParams.dialog.title}`;

  Object.assign(panelParams.dialog, {
    data_id: `${layer.key}-${panelType.key}-dialog`,
    target: document.getElementById('Map'),
    content: layer[panelType.key].content,
    height: 'auto',
    left: '5em',
    top: '0.5em',
    class: 'box-shadow',
    css_style: 'min-width: 300px; width: 350px',
    containedCentre: true,
    contained: true,
    headerDrag: true,
    minimizeBtn: true,
    closeBtn: true,
    onClose: () => {
      // Toggle the active class on the button
      panelParams.dialog.btn.classList.remove('active');
    },
  });

  mapp.ui.elements.dialog(panelParams.dialog);

  //Setup a dialog.view where the panel needs a reference to a specific element.
  if (panelType.setView) {
    panelParams.dialog.view = panelParams.dialog.node.querySelector(
      `#${panelType.setView}`,
    );
  }
}
