/**
## mapp.utils.dataURLtoBlob()

@module /utils/dataURLtoBlob
*/

export function dataURLtoBlob(dataURL) {
  if (dataURL.indexOf(';base64,') == -1) {
    const parts = dataURL.split(','),
      contentType = parts[0].split(':')[1],
      raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  const parts = dataURL.split(';base64,'),
    contentType = parts[0].split(':')[1],
    raw = window.atob(parts[1]),
    uInt8Array = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
