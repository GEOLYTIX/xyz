/**

Module exporting language translations for various languages.

@typedef {object} dictionaries

@property {object} en English translations
@property {object} de German translations
@property {object} fr French translations
@property {object} pl Polish translations
@property {object} ja Japanese translations
@property {object} zh Chinese (Simplified) translations
@property {object} zh_tw Chinese (Traditional) translations
@property {object} esp Spanish translations
@property {object} it Italian translations
@property {object} tr Turkish translations
@property {object} th Thai translations

*/

// Importing language translations for each language
import en from './en.mjs'; // English
import de from './de.mjs'; // German
import fr from './fr.mjs'; // French
import pl from './pl.mjs'; // Polish
import ja from './ja.mjs'; // Japanese
import zh from './cn.mjs'; // Chinese (Simplified)
import zh_tw from './cn_trad.mjs'; // Chinese (Traditional)
import esp from './esp.mjs'; // Spanish
import it from './it.mjs'; // Italian
import tr from './tr.mjs'; // Turkish
import th from './th.mjs'; // Thai

// Exporting an object containing language translations for various languages
export default {
  en: en,
  de: de,
  fr: fr,
  pl: pl,
  ja: ja,
  zh: zh,
  zh_tw: zh_tw,
  esp: esp,
  it: it,
  tr: tr,
  th: th
}
