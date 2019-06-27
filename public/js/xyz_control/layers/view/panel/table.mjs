export default (_xyz, layer) => {

    if (_xyz.mobile || !layer.tableview || !layer.tableview.tables || !layer.tableview.charts) return;

    // Create cluster panel and add to layer dashboard.
    layer.tableview.panel = _xyz.utils.createElement({
        tag: 'div',
        options: {
            classList: 'panel expandable'
        },
        appendTo: layer.view.dashboard
    });

    // Panel title / expander.
    _xyz.utils.createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Table'
        },
        appendTo: layer.tableview.panel,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                _xyz.utils.toggleExpanderParent({
                    expandable: layer.tableview.panel,
                    accordeon: true,
                    scrolly: _xyz.desktop && _xyz.desktop.listviews
                });
            }
        }
    });

    // Return if tableview has no table definition.
    //if(!layer.tableview.tables) return;

    if (!_xyz.tableview.node) return;

    // Iterate through tables entries.
    if (layer.tableview.tables) {
        Object.keys(layer.tableview.tables).forEach(key => {

            const table = layer.tableview.tables[key];

            table.key = key;
            table.layer = layer;
            table.title = table.title || key;
            table.target = _xyz.tableview.node.querySelector('.table');

            if (!table.target) table.target = _xyz.tableview.tableContainer();

            table.show = () => _xyz.tableview.layerTable(table);
            table.remove = () => _xyz.tableview.removeTab(table);

            // Create checkbox to toggle whether table is in tabs list.
            _xyz.utils.createCheckbox({
                label: table.title,
                appendTo: layer.tableview.panel,
                checked: !!table.display,
                onChange: e => {

                    table.display = e.target.checked;

                    if (!table.display) return table.remove();

                    layer.show();

                }
            });

            if (table.display && layer.display) table.show();

        });
    }

    if (layer.tableview.charts) {
        Object.keys(layer.tableview.charts).forEach(key => {

            const chart = layer.tableview.charts[key];

            chart.key = key;
            chart.layer = layer;
            chart.title = chart.title || key;
            chart.target = _xyz.tableview.node.querySelector('.table');

            if (!chart.target) chart.target = _xyz.tableview.tableContainer();

            chart.show = () => _xyz.tableview.layerDashboard(chart);
            chart.remove = () => _xyz.tableview.removeTab(chart);

            // Create checkbox to toggle whether table is in tabs list.
            _xyz.utils.createCheckbox({
                label: chart.title,
                appendTo: layer.tableview.panel,
                checked: !!chart.display,
                onChange: e => {
                    chart.display = e.target.checked;
                    if (!chart.display) return chart.remove();
                    layer.show();
                }
            });

            if (chart.display && layer.display) chart.show();
            
        });
    }

};