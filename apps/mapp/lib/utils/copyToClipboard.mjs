/**
## /utils/copyToClipboard

The utils module expose the clipboard api.

@module /utils/copyToClipboard
*/

/**
@function copyToClipboard
@description
The method writes the string param to the clipboard.

@param {string} text_to_copy string which will be written to clipboard.
*/
export default function copyToClipboard(text_to_copy) {
  navigator.clipboard.writeText(text_to_copy);
}
