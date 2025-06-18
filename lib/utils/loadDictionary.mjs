export default async function loadDictionary(languageCode) {
  try {
    // Dynamically import the JSON language file
    const response = await fetch(
      `../../public/dictionaries/${languageCode}.json`,
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
