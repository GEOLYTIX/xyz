const dictionary = new Proxy({}, {
  get: function(target, key, receiver) {
    if (mapp.dictionaries[mapp.language][key]) {
      return mapp.dictionaries[mapp.language][key];
    }
    return mapp.dictionaries.en[key];
  }
});
export default dictionary;
