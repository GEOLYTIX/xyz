/**
## /dictionaries

The dictionaries module imports en language and exports these as properties for the mapp.dictionaries{} object.
en is the default language, so this is bundled and loaded by default. 
Other languages can be added using the mergeLanguage utility.
@property {object} en English translations

@module /dictionaries
*/

// Importing language translations for each language
import en from './en.json'; // English

// Exporting an object containing en translation by default only 
export default {
  en
};
