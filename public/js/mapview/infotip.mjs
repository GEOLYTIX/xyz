export default _xyz => {

  return {
    create: create,
    position: position,
  };
  
  function create(info) {

    if (this.node) this.node.remove();

    this.node = _xyz.utils.wire()`<div class="infotip">${info}`;

    _xyz.mapview.node.appendChild(this.node);

    this.position();
  }

  function position() {

    this.node.style.opacity = 1;

    this.node.style.left = (_xyz.mapview.pointerLocation.x - (this.node.offsetWidth / 2)) + 'px';
    
    this.node.style.top = (_xyz.mapview.pointerLocation.y - 15 - this.node.offsetHeight) + 'px';
  }

};