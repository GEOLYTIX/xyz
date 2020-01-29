export default _xyz => function () {

	const layer = this;

	if(layer.L.getZIndex() === 1000) return;

	Object.values(_xyz.layers.list).map(_layer => {

		if( _layer.format !== 'tiles') _layer.L.setZIndex(_layer.style.zIndex || 1) && (_layer.display && _layer.reload());

	});

	layer.L.setZIndex(1000);

	layer.reload();

}