export default _xyz => {

  const tabview = {
    init: init,
  };

  return tabview;

  function init(params) {

    if (!params.target) return;

    tabview.node = params.target;

    const bar = _xyz.utils.wire()`<div class="tab-bar">`

    tabview.bar = _xyz.utils.wire()`<div>`;

    bar.appendChild(tabview.bar);

    tabview.node.appendChild(bar);

    tabview.panel = _xyz.utils.wire()`<div class="tab-panel">`

    tabview.node.appendChild(tabview.panel);

    tabview._dataviews = new Set();

    let timer

    tabview.add = dataview => {

      // Add tab and target to panel if dataview tab already exists.
      if (dataview.showTab) {

        tabview.bar.appendChild(dataview.tab)
        tabview.panel.appendChild(dataview.target);

        tabview._dataviews.add(dataview);

        return dataview.showTab();
      }

      dataview.showTab = () => {

        tabview._dataviews.forEach(view => {
          view.target.style.display = 'none';
          view.tab.classList.remove('active');
          view.target.classList.remove('active');
        });

        dataview.tab.classList.add('active');
        dataview.target.style.display = 'grid';
        dataview.target.classList.add('active');
        tabview.node.style.display = 'block';
        dataview.update && dataview.update();
        dataview.dataviews && dataview.dataviews.forEach(_dataview => _dataview.update());
        if (_xyz.mapview.attribution.container) _xyz.mapview.attribution.container.style.bottom = '65px';
      }

      dataview.tab = _xyz.utils.wire()`
      <div
        style="${dataview.tab_style || ''}"
        class="active"
        onclick=${() => {
          clearTimeout(timer);
          timer = setTimeout(() => dataview.showTab(), 500);
        }}>${dataview.title || dataview.key || dataview.label}`

      tabview.bar.appendChild(dataview.tab);

      dataview.target = _xyz.utils.wire()`
        <div
          class="${dataview.class || ''}"
          style="${dataview.style || ''}">`;

      tabview.panel.appendChild(dataview.target);

      _xyz.dataviews.create(dataview);

      tabview._dataviews.add(dataview);

      dataview.remove = () => {
        dataview.target.remove();
        dataview.layer && dataview.layer._dataviews.delete(dataview);

        dataview.tab.remove();
        tabview._dataviews.delete(dataview);

        if (tabview._dataviews.size) return Array.from(tabview._dataviews)[0].showTab()
        
        // Hide tabview container if no dataviews remain in set _dataviews.
        tabview.node.style.display = 'none';

        if (_xyz.mapview.attribution.container) _xyz.mapview.attribution.container.style.bottom = '0';
      };

      dataview.tab.click();

    }

  }

}