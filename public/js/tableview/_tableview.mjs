import _xyz from '../_xyz.mjs';
import tableview from './tableview.mjs';
import layout from './layout.mjs';
import nav from './nav.mjs';

export default () => {

  _xyz.view.desktop = {};
    
  _xyz.view.desktop.tableview = tableview();

  _xyz.view.desktop.tableview.appendChild(layout());

  nav();

  //layout(_xyz.view.desktop.tableview);

};
