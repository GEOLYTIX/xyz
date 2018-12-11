import _xyz from './_xyz.mjs';

export default () => {

  _xyz.panes.next = 500;

  _xyz.panes.list = [];

  _xyz.panes.list.push(_xyz.map.createPane('tmp'));
  _xyz.map.getPane('tmp').style.zIndex = 549;

  _xyz.panes.list.push(_xyz.map.createPane('gazetteer'));
  _xyz.map.getPane('gazetteer').style.zIndex = 550;

  _xyz.panes.list.push(_xyz.map.createPane('select_display'));
  _xyz.map.getPane('select_display').style.zIndex = 599;

  _xyz.panes.list.push(_xyz.map.createPane('select'));
  _xyz.map.getPane('select').style.zIndex = 600;

  _xyz.panes.list.push(_xyz.map.createPane('select_marker'));
  _xyz.map.getPane('select_marker').style.zIndex = 601;

  _xyz.panes.list.push(_xyz.map.createPane('select_circle'));
  _xyz.map.getPane('select_circle').style.zIndex = 602;

  _xyz.panes.list.push(_xyz.map.createPane('rectangle'));
  _xyz.map.getPane('rectangle').style.zIndex = 603;

};