export default {
  modify,
  draw
}

function modify(e) {

  e && e.preventDefault()

  const menu = []

  // Show save option in contextmenu
  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`)

  // Add cancel option to contextmenu.
  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish()}>
      ${mapp.dictionary.cancel}`)

  // Set context menu popup on last vertex.
  this.popup({
    coords: this.interaction.vertices[this.interaction.vertices.length - 1],
    content: mapp.utils.html.node`<ul>${menu}`,
  })
}

function draw(e) {

  if (this.interaction.vertices.length === 0) return;

  const menu = []

  menu.push(mapp.utils.html`
  <li
    onclick=${() => this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`)

  menu.push(mapp.utils.html`
    <li
      onclick=${() => this.interaction.finish()}>
      ${mapp.dictionary.cancel}`)

  // Set timeout to for the drawend popup to appear after async onchange event popup.
  setTimeout(() => this.popup({
    coords: this.interaction.vertices[this.interaction.vertices.length - 1],
    content: mapp.utils.html.node`<ul>${menu}`,
    autoPan: true
  }), 100)
}