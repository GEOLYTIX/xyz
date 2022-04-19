export default {
  modify,
  draw
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    remove_last_vertex: "Remove last vertex",
  },
  de: {
    remove_last_vertex: "Remove last vertex",
  },
  cn: {
    remove_last_vertex: "删除最后一个顶点",
  },
  pl: {
    remove_last_vertex: "Usuń ostatni wierzchołek",
  },
  ko: {
    remove_last_vertex: "마지막 정점(꼭지점) 제거",
  },
  fr: {
    remove_last_vertex: "Effacer le dernier point",
  },
  ja: {
    remove_last_vertex: "最後のバーテックスを削除",
  }
})

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
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`)

  // Set context menu popup on last vertex.
  this.popup({
    coords: this.interaction.vertices[this.interaction.vertices.length-1],
    content: mapp.utils.html.node`<ul>${menu}`,
  })
}

function draw(e) {

  if (this.interaction.vertices.length === 0) return;

  e && e.preventDefault()

  const features = this.interaction.Layer.getSource().getFeatures()
   
  const menu = []
  
  features.length && menu.push(mapp.utils.html`
  <li
    onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`)

  !features.length && menu.push(mapp.utils.html`
    <li
      onclick=${e=>{
        this.interaction.interaction.removeLastPoint()
        this.interaction.vertices.pop()
        this.popup(null)
      }}>${mapp.dictionary.remove_last_vertex}`)

  menu.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`)

  this.popup({
    coords: this.interaction.vertices[this.interaction.vertices.length - 1],
    content: mapp.utils.html.node`<ul>${menu}`,
    autoPan: true
  })
}