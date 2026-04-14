export default {
  draw,
  modify,
};

/**
## /ui/elements/contextMenu
Dictionary entries:
- save
- cancel

@requires /dictionary

@module /ui/elements/contextMenu
Exports the modify and draw context menu methods as mapp.ui.elements.contextMenu()


/** 
 * @function modify
 * @description 
 * This is a context menu for the modify interaction.
 * It pushes the save and cancel options to the context menu.
 * @params {Object} e The event object.
 * @returns {void}
 */

function modify(e) {
  e?.preventDefault?.();

  const menu = [];

  // Show save option in contextmenu
  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`);

  // Add cancel option to contextmenu.
  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish()}>
      ${mapp.dictionary.cancel}`);

  // Set context menu popup on last vertex.
  this.popup({
    content: mapp.utils.html.node`<ul>${menu}`,
    coords: this.interaction.vertices[this.interaction.vertices.length - 1],
  });
}

/**
 * @function draw
 * @description
 * This is a context menu for the draw interaction.
 * It pushes the save and cancel options to the context menu.
 * @params {Object} e The event object.
 * @returns {void}
 */

function draw(e) {
  if (this.interaction.vertices.length === 0) return;

  const menu = [];

  menu.push(mapp.utils.html`
  <li
    onclick=${() => this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`);

  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish()}>
      ${mapp.dictionary.cancel}`);

  // Set timeout to for the drawend popup to appear after async onchange event popup.
  setTimeout(
    () =>
      this.popup({
        autoPan: true,
        content: mapp.utils.html.node`<ul>${menu}`,
        coords: this.interaction.vertices[this.interaction.vertices.length - 1],
      }),
    100,
  );
}
