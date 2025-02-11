export default (layer) => {
  const meta = mapp.utils.html.node`<p data-id="meta" class="meta">`;
  meta.innerHTML = layer.meta;
  return meta;
};
