/**
## /dictionary

The dictionary module exports a proxy object to get values from the mapp.dictionaries{}.

@module /dictionary
*/

import en from '../public/dictionaries/en.mjs';

export const dictionary = new Proxy({}, { get });

/**
@function get

@description
The proxy getter will check whether the mapp.language is supported by the mapp.dictionaries or set 'en' english as default language.

A check will be performed if the key exists in the english dictionary of the key doesn't exist in the language dictionary.

The key itself will be returned if no lookup exists in the language or english mapp.dictionaries.

@param {string} key The property key of the requested dictionary entry.
*/
function get(target, key, receiver) {
  if (!Object.hasOwn(mapp.dictionaries, mapp.language)) {
    // Set language to english if mapp.language is not supported by mapp.dictionaries.
    console.warn(
      `'${mapp.language}' mapp.language is not supported by mapp.dictionaries.`,
    );
    mapp.language = 'en';
  }

  // Check whether key exists in dictionaries language.
  if (Object.hasOwn(mapp.dictionaries[mapp.language], key)) {
    return mapp.dictionaries[mapp.language][key];
  }

  // Check whether key exists in english dictionary.
  if (Object.hasOwn(mapp.dictionaries.en, key)) {
    return mapp.dictionaries.en[key];
  }

  return key;
}

export const dictionaries = { en };
