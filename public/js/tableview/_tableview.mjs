import _xyz from '../_xyz.mjs';
import tableview from './tableview.mjs';
import layout from './layout.mjs';

export default () => {

  _xyz.view.desktop = {};
    
  _xyz.view.desktop.tableview = tableview();

  layout(_xyz.view.desktop.tableview);

};
