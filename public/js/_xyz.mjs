import * as utils from './utils.mjs';

export default {
  attribution: { 
    layer: {} 
  },
  dom: {
    map: document.getElementById('Map')
  },
  gazetteer: {},
  hooks: {
    current: {}
  },
  host: document.head.dataset.dir,
  layers: {
    groups: {},
    list: {}
  },
  locate: {},
  locations: {
    list: [
      {
        letter: 'A',
        color: '#9c27b0'
      },
      {
        letter: 'B',
        color: '#2196f3'
      },
      {
        letter: 'C',
        color: '#009688'
      },
      {
        letter: 'D',
        color: '#cddc39'
      },
      {
        letter: 'E',
        color: '#ff9800'
      },
      {
        letter: 'F',
        color: '#673ab7'
      },
      {
        letter: 'G',
        color: '#03a9f4'
      },
      {
        letter: 'H',
        color: '#4caf50'
      },
      {
        letter: 'I',
        color: '#ffeb3b'
      },
      {
        letter: 'J',
        color: '#ff5722'
      },
      {
        letter: 'K',
        color: '#0d47a1'
      },
      {
        letter: 'L',
        color: '#00bcd4'
      },
      {
        letter: 'M',
        color: '#8bc34a'
      },
      {
        letter: 'N',
        color: '#ffc107'
      },
      {
        letter: 'O',
        color: '#d32f2f'
      }]
  },
  log: typeof document.body.dataset.log !== 'undefined',
  map: {},
  nanoid: document.body.dataset.nanoid,
  panes: {
    init: {},
    list: {},
    next: 500
  },
  state: 'select',
  token: null,
  utils: utils,
  view: { 
    mode: document.body.dataset.viewmode,
    set: {}
  }
};
