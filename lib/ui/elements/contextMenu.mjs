export default {
  modify,
  draw,
};

mapp.utils.merge(mapp.dictionaries, {
  en: {
    remove_last_vertex: 'Remove last vertex',
    delete_vertex: 'Remove vertex',
  },
  de: {
    remove_last_vertex: 'Entferne letzten Scheitelpunkt',
    delete_vertex: 'Entferne Scheitelpunkt',
  },
  zh: {
    remove_last_vertex: '删除最后一个顶点',
    delete_vertex: '删除顶点',
  },
  zh_tw: {
    remove_last_vertex: '刪除最後一個頂點',
    delete_vertex: '刪除頂點',
  },
  pl: {
    remove_last_vertex: 'Usuń ostatni wierzchołek',
    delete_vertex: 'Usuń wierzchołek',
  },
  fr: {
    remove_last_vertex: 'Supprimer le dernier sommet',
    delete_vertex: 'Supprimer les sommets',
  },
  ja: {
    remove_last_vertex: '最後のバーテックスを削除',
    delete_vertex: 'バーテックスを削除',
  },
  esp: {
    remove_last_vertex: 'Eliminar el último vértice',
    delete_vertex: 'Eliminar vértice',
  },
  tr: {
    remove_last_vertex: 'Son verteksi kaldir',
    delete_vertex: 'Verteksi kaldir',
  },
  it: {
    remove_last_vertex: "Eliminare l'ultimo vertice",
    delete_vertex: 'Elimina vertice',
  },
  th: {
    remove_last_vertex: 'ลบจุดยอดสุดท้าย',
    delete_vertex: 'ลบจุดยอด',
  },
});

function modify(e) {
  e && e.preventDefault();

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
    coords: this.interaction.vertices[this.interaction.vertices.length - 1],
    content: mapp.utils.html.node`<ul>${menu}`,
  });
}

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
        coords: this.interaction.vertices[this.interaction.vertices.length - 1],
        content: mapp.utils.html.node`<ul>${menu}`,
        autoPan: true,
      }),
    100,
  );
}
