export default _xyz => {

  const attribution = {

    create: create,

    check: check,

    links: _xyz.utils.html.node`<div>`,

  }

  return attribution

  function create() {

    if (!_xyz.locale.attribution.target) return

    attribution.node = _xyz.locale.attribution.target

    _xyz.locale.attribution.target.appendChild(attribution.links)
  }

  function check() {

    const o = Object.assign({}, _xyz.locale.attribution && _xyz.locale.attribution.links || {})

    Object.values(_xyz.layers.list).forEach(layer => {
      layer.display && layer.attribution && Object.assign(
        o,
        layer.attribution)
    })

    _xyz.utils.render(attribution.links, _xyz.utils.html`
    ${Object.entries(o).map(entry => _xyz.utils.html`
      <a target="_blank" href="${entry[1]}">${entry[0]}`)}`
    )

  }

}