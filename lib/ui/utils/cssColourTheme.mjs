
const defaultTheme = {
  // Backgrounds
  base: '#f2f2f2',
  'base-secondary': '#f2f2f2',
  'base-tertiary': '#fafafa',
  'base-contrast': '#ffffff',
  // Border
  'base-border': '#dddddd',
  // Text
  text: '#3f3f3f',
  'text-secondary': '#858585',
  'text-tertiary': '#dddddd',
  // Accents
  accent: '#003d57',
  'accent-active': '#d57120',
  'accent-hover': '#939faa',
  // Information
  info: '#0b6f50',
  blocked: '#a21309',
  changed: '#ffffa7',
};

export default function setTheme(colourTheme) {
  const root = document.querySelector(':root');

  colourTheme = Object.assign(structuredClone(defaultTheme), colourTheme);

  // add defined variabled to the root style
  Object.entries(colourTheme).map((entry) => {
    root.style.setProperty(`--color-${entry[0]}`, `${entry[1]}`);
  });
}
