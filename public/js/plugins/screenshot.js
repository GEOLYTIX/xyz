import html2canvas from 'https://cdn.skypack.dev/html2canvas';

export default (function(){

  const btnColumn = document.getElementById("mapButton")

  if(!btnColumn) return;

  btnColumn.append(mapp.utils.html.node`
    <button
      class="mask-icon add-photo mobile-display-none"
      title="Create screenshot from map canvas."
      onclick=${(e) => {

        html2canvas(document.querySelector('.ol-viewport')).then((canvas) => {

          const blob = canvasToBlob(canvas)

          const blobUrl = URL.createObjectURL(blob);

          // var link = document.createElement("a");
          // link.href = blobUrl;
          // link.download = "screenshot.png";
          // document.body.appendChild(link);
          // link.click();

          window.open(blobUrl, "_blank");
        });
      
    }}>`);

})()

function canvasToBlob(canvas) {

  const byteArrays = [];

  const base64ImageData = canvas.toDataURL("image/png");

  const byteCharacters = atob(
    base64ImageData.substr(`data:image/png;base64,`.length)
  );

  for (
    let offset = 0;
    offset < byteCharacters.length;
    offset += 1024
  ) {
    const slice = byteCharacters.slice(offset, offset + 1024);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: "image/png" });

  return blob;
}
