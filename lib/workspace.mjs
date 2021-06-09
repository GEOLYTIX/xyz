export default (_xyz) => {
  return {
    get: {
      layer: (params) => get('layer', params),
      locale: (params) => get('locale', params),
      locales: (params) => get('locales', params),
    },
    locale: {},
  };

  function get(key, params = {}) {
    return _xyz.xhr({
      url:
        `${_xyz.host}/api/workspace/get/${key}?` +
        _xyz.utils.paramString(params),
    });
  }
};
