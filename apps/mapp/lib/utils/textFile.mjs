/**
## /utils/textFile

@module /utils/textFile
*/

/**
@function textFile

@description TextFile Utils

@param {Object} params 
@property  {string} params.text
*/
export default function textFile(params) {
  if (typeof params.text !== 'string') return;

  params.filename ??= 'file.txt';

  params.type ??= 'text';

  const blob = new Blob([params.text], {
    type: params.type,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${params.filename}`;
  a.click();
  URL.revokeObjectURL(url);
}
