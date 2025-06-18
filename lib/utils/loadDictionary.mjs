export default async function loadDictionary(languageCode) {
  try {
    // Dynamically import the JSON language file
    const languageData = await fetch(
      `../../public/dictionaries/${languageCode}.json`
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
