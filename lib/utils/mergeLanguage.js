/**
## mapp.utils.mergeLanguage()

@module /utils/mergeLanguage
*/

/**
@function mergeLanguage 
  
@description
The mergeLanguage utility method dynamically imports a JSON language file based on the provided language code and merges its content into the `mapp.dictionaries` object.
```

@param {string} languageCode The code of the language to import and load onto the mapp.dictionaries object.
*/
export async function mergeLanguage(languageCode) {
  try {

    // Dynamically import the JSON language file
    const languageData = await import(
      `../../public/dictionaries/${languageCode}.json`,
      {
        assert: { type: 'json' },
      }
    );

    // Merge the imported data into mapp.dictionaries
    mapp.dictionaries[languageCode] = {
      ...mapp.dictionaries[languageCode],
      ...languageData.default,
    };
  } catch (error) {
    console.error(`Failed to load language "${languageCode}":`, error);
  }
}
