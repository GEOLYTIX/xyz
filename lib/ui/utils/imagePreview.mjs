/**
## ui/utils/imagePreview

@module /ui/utils/imagePreview
*/

/**
@function imagePreview

@description
The imagePreview utility method can be assigned to an image element onclick.

@param {Object} e Image element click event. 
*/
export default function imagePreview(e) {
  const previewElement = mapp.utils.html.node`
  <div class="interface-mask">
    <div
      class="bg-image" 
      style=${`background-image:url(${e.target.src})`}>
    <button 
      class="btn-close mask-icon close"
      onclick=${(e) => e.target.closest('.interface-mask').remove()}>`;

  document.body.append(previewElement);
}
