export default () => ({
  attribution: { 
    layer: {} 
  },
  gazetteer: {},
  hooks: {
    current: {}
  },
  draw: {},
  host: null,
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
        color: '#cddc39',
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
  log: null,
  map: null,
  nanoid: null,
  panes: {
    list: {}
  },
  state: 'select',
  style: {
    defaults: {
      // drawn feature vertex
      vertex: {
        pane: 'drawing',
        stroke: true,
        color: 'darkgrey',
        fillColor: 'steelblue',
        weight: 1,
        radius: 5
      },
      // trail left behind cursor
      trail: {
        pane: 'drawing',
        stroke: true,
        color: '#666',
        dashArray: '5 5',
        weight: 1
      },
      // actual drawn feature
      path: { 
        pane: 'drawing',
        stroke: true,
        color: '#666',
        fill: true,
        fillColor: '#cf9',
        weight: 2
      },
      // actual drawn feature
      path_line: { 
        pane: 'drawing',
        stroke: true,
        color: '#666',
        weight: 2
      },
      // new staged point
      point: {
        pane: 'drawing',
        stroke: true,
        color: 'darkgrey',
        fillColor: 'steelblue',
        weight: 2,
        radius: 8
      },
      colours: [
        { hex: '#c62828', name: 'Fire Engine Red' },
        { hex: '#f50057', name: 'Folly' },
        { hex: '#9c27b0', name: 'Dark Orchid' },
        { hex: '#673ab7', name: 'Plump Purple' },
        { hex: '#3f51b5', name: 'Violet Blue' },
        { hex: '#2196f3', name: 'Dodger Blue' },
        { hex: '#03a9f4', name: 'Vivid Cerulean' },
        { hex: '#00bcd4', name: 'Turquoise Surf' },
        { hex: '#009688', name: 'Dark Cyan' },
        { hex: '#4caf50', name: 'Middle Green' },
        { hex: '#8bc34a', name: 'Dollar Bill' },
        { hex: '#cddc39', name: 'Pear' },
        { hex: '#ffeb3b', name: 'Banana Yellow' },
        { hex: '#ffb300', name: 'UCLA Gold' },
        { hex: '#fb8c00', name: 'Dark Orange' },
        { hex: '#f4511e', name: 'Orioles Orange' },
        { hex: '#8d6e63', name: 'Dark Chestnut' },
        { hex: '#777777', name: 'Sonic Silver' },
        { hex: '#bdbdbd', name: 'X11 Gray' },
        { hex: '#aaaaaa', name: 'Dark Medium Gray' },
        { hex: '#78909c', name: 'Light Slate Gray' }
      ]
    }
  },
  tableview: {},
  token: null,
  utils: null,
  view: { 
    mode: null
  }
});