export default (params) => {
  console.warn('mapp.ui.elements.dropdown should be used with the multi flag');

  params.multi = true;

  return mapp.ui.elements.dropdown(params);
};
