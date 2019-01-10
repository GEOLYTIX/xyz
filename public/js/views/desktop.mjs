export default _xyz => {

  // remove polyfill for IE11
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  // add scrollbar on the left to control container.
  _xyz.utils.scrolly(document.querySelector('.mod_container > .scrolly'));

  // reset scrollbar on control container after window resize.
  window.addEventListener('resize', () => _xyz.utils.scrolly(document.querySelector('.mod_container > .scrolly')));
};