document.dispatchEvent(new CustomEvent('bring_layer_to_front', {
  detail: _xyz => {

    _xyz.layers.plugins.bring_layer_to_front = layer => {

      layer.view.appendChild(_xyz.utils.html.node`
      <div style="padding-right: 5px">
      <button 
        title=${_xyz.language.layer_style_bring_to_front}
        style="margin-top: 5px;"
        class="btn-wide primary-colour"
        onclick=${()=>layer.bringToFront()}>${_xyz.language.layer_style_bring_to_front}`)

    }

  }
}))