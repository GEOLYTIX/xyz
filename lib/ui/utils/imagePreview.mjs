/**
## ui/utils/imagePreview

@module /ui/utils/imagePreview
*/

export default (e) => {
  document.body.append(mapp.utils.html.node`
    <div class="interface-mask">
      <div class="bg-image" style=${`background-image:url(${e.target.src})`}>
      <button class="btn-close mask-icon close"
        onclick=${(e) => e.target.parentElement.parentElement.remove()}>`);
};
