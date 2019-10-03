// Create temporary textarea to copy string to clipboard.
export function copyToClipboard(str) {

  let textArea = _xyz.utils.wire()`<textarea style="visibility=none;">`;
  textArea.value = str;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();

}