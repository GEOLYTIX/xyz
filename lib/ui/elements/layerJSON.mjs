export default async function layerJSON(layer) {
    // Create a content div for the dialog.
    const content = mapp.utils.html.node`<div>`;

    const jsonLayer = mapp.utils.jsonParser(layer);
    console.log(jsonLayer);

    // Use the content as target for the jsoneditor control.
    const jsoneditor = await mapp.ui.elements.jsoneditor({
        props: {
            onRenderMenu: renderMenu,
            content: { json: jsonLayer }
        },
        target: content,

    });

    return content;

    // Create a custom menu for the userLayer jsoneditor control.
    function renderMenu(items) {
        // Push button to add layer to mapview layers.
        items.push(
            {
                className: 'material-symbols-outlined-important',
                onClick: updateLayer,
                text: 'frame_reload',
                title: 'Update Layer',
                type: 'button',
            }
        );

        return items
            .filter((item) => item.text !== 'tree')
            .filter((item) => item.text !== 'table')
            .filter((item) => item.type !== 'separator')
            .filter((item) => item.className !== 'jse-undo')
            .filter((item) => item.className !== 'jse-redo')
            .filter((item) => item.className !== 'jse-search')
            .filter((item) => item.className !== 'jse-contextmenu')
            .filter((item) => item.className !== 'jse-sort')
            .filter((item) => item.className !== 'jse-transform');
    }

    async function updateLayer() {

        const content = plugin.jsoneditor.get();

        const jsonLayer = JSON.parse(content.data);

        console.log(jsonLayer);
    }
}