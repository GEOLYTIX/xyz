/**
## /dictionary

The dictionary module exports a proxy object to get values from the mapp.dictionaries{}.

The proxy getter will check whether the mapp.language is supported by the mapp.dictionaries or use 'en' english as default language.

A check will be performed if the key exists in the english dictionary of the key doesn't exist in the language dictionary.

The key itself will be returned if no lookup exists in the language or english mapp.dictionaries.

@requires /dictionaries

@module /dictionary
*/

export default new Proxy(
  {},
  {
    get: function (target, key, receiver) {
      let language = mapp.language;

      if (!Object.hasOwn(mapp.dictionaries, language)) {
        // Set language to english if mapp.language is not supported by mapp.dictionaries.
        console.warn(
          `'${mapp.language}' mapp.language is not supported by mapp.dictionaries.`,
        );
        language = 'en';
      }

      // Check whether key exists in dictionaries language.
      if (Object.hasOwn(mapp.dictionaries[language], key)) {
        return mapp.dictionaries[language][key];
      }

      // Check whether key exists in english dictionary.
      if (Object.hasOwn(mapp.dictionaries.en, key)) {
        return mapp.dictionaries.en[key];
      }

      return key;
    },
  },
);
