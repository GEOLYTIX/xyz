/**
 * Module exporting language translations for various languages.
 * @module _dictionaries
 */

// Importing language translations for each language
import en from './en.mjs';     // English
import de from './de.mjs';     // German
import fr from './fr.mjs';     // French
import pl from './pl.mjs';     // Polish
import ja from './ja.mjs';     // Japanese
import zh from './cn.mjs';     // Chinese (Simplified)
import zh_tw from './cn_trad.mjs';  // Chinese (Traditional)
import esp from './esp.mjs';   // Spanish
import it from './it.mjs';     // Italian
import tr from './tr.mjs';     // Turkish
import th from './th.mjs';     // Thai

/**
 * - The `mapp.dictionary` is an object proxy. The get handler will use the mapp.language (default: en) value to lookup the requested key in the mapp.dictionaries. The English value will be returned if mapp.language entry has not been specified.
 * - The `mapp.dictionaries` object can be extended in any of the javascript modules imported into the mapp library.

@example
new Proxy({}, {
 get: function(target, key, receiver){
  
 if (mapp.dictionaries[mapp.language][key]) {
  return mapp.dictionaries[mapp.language][key]
 }
  
 return mapp.dictionaries.en[key]
}})

 * @typedef {Object} _dictionaries
 * @property {en} en - English translations
 * @property {de} de - German translations
 * @property {fr} fr - French translations
 * @property {pl} pl - Polish translations
 * @property {ja} ja - Japanese translations
 * @property {zh} zh - Chinese (Simplified) translations
 * @property {zh_tw} zh_tw - Chinese (Traditional) translations
 * @property {esp} esp - Spanish translations
 * @property {it} it - Italian translations
 * @property {tr} tr - Turkish translations
 * @property {th} th - Thai translations
 */

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
