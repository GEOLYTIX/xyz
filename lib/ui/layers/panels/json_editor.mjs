export default function json_editor(layer) {
    const button = mapp.utils.html.node`<button data-id="json_editor">JSON Editor</button>`;
    button.addEventListener('click', async () => {
        const content = await mapp.ui.elements.layerJSON(layer);
        const dialog = mapp.ui.elements.dialog({
            content
        });
    });
    return button;
};
