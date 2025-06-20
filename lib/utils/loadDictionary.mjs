/**
## /utils/loadDictionary

The loadDictionary module exports a default method to load a language dictionary.

@module /utils/loadDictionary
*/

/**
@function loadDictionary

@description
The method will fetch a json language dictionary from the public directory and merge the language object into the mapp.dictionaries.

@param {string} languageCode The language code for the dictionary to be loaded.
*/
export default async function loadDictionary(languageCode) {
  try {
    // Dynamically import the JSON language file
    const response = await fetch(
      `${mapp.host}/public/dictionaries/${languageCode}.json`,
    );

    const languageData = await response.json();

    // Merge the imported data into mapp.dictionaries
    mapp.dictionaries[languageCode] = {
      ...mapp.dictionaries[languageCode],
      ...languageData,
    };
  } catch (error) {
    console.error(`Failed to fetch language "${languageCode}":`, error);
  }
}
