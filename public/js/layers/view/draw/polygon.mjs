export default _xyz => layer => _xyz.utils.wire()`
<button
  class="btn-wide primary-colour"
  onclick=${e => {

    e.stopPropagation();
    const btn = e.target;

    if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.finish();

    btn.classList.add('active');
    layer.show();
    layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg');

    _xyz.mapview.interaction.draw.begin({
      layer: layer,
      type: 'Polygon',
      callback: () => {
        layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg');
        btn.classList.remove('active');
      }
    });

  }}>Polygon`