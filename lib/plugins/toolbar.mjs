export function toolbar(plugin, mapview) {
  console.log('hello world!');

  const container = mapp.utils.html
    .node`<div class="core-menu">Hello I am a core menu!`;

  document.body.append(container);
}
