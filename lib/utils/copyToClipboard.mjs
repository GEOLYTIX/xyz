/**
## mapp.utils.copyToClipboard()

@module /utils/copyToClipboard
*/

// Create temporary textarea to copy string to clipboard.
export function copyToClipboard(str) {

  const textArea = document.body.appendChild(mapp.utils.html.node`
    <textarea style="visibility=none;">`);
  
  textArea.value = str;
  textArea.select();
  document.execCommand('copy');
  textArea.remove();

}