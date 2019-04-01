export default _xyz => {

  _xyz.desktop = {};

  // remove polyfill for IE11
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  _xyz.desktop.mask = document.getElementById('desktop_mask');

  _xyz.desktop.listviews = document.querySelector('.listviews > .scrolly');

  // add scrollbar on the left to control container.
  _xyz.utils.scrolly(_xyz.desktop.listviews);

  // reset scrollbar on control container after window resize.
  window.addEventListener('resize', () => _xyz.utils.scrolly(_xyz.desktop.listviews));
};