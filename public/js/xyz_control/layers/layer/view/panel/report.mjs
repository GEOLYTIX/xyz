export default (_xyz, layer) => {

  if (!layer.report) return;

  if (!layer.report.templates) {
    layer.report.templates = {};
    layer.report.templates['Report'] = {};
    layer.report.templates['Report'].template = 'default';
  }

  layer.report.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.view.dashboard
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Reporting'
    },
    appendTo: layer.report.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: layer.report.panel,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews
        });
      }
    }
  });

  Object.entries(layer.report.templates).map(entry => {
		
    let _r = {'name': entry[0], 'template': entry[1].template};

    layer.report[_r.name] = layer.report.panel.appendChild(
      _xyz.utils.hyperHTML.wire(_r)`
			<div style="padding: 10px 0;">
			<a style="color: #090;cursor:pointer;"><i class="material-icons" style="vertical-align:bottom; font-size: 16px;">event_note</i>${_r.name}`
    );

    layer.report[_r.name].addEventListener('click', () => {
      console.log('create ' + _r.name + ' in a new tab with ' + _r.template);
      //window.open(_xyz.host + '/layer/report?layer=' + entry.location.layer  + '&id=' + entry.location.id + '&locale=' + _xyz.workspace.locale.key + '&token=' + _xyz.token + '&template=' + template + '&layers=' + _xyz.hooks.current.layers, '_blank');
    });
  });
};