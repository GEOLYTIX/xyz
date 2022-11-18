const infotip = {}

export default function(content) {

  const mapview = this;

  // Remove infotip node element
  infotip.node?.remove()

  // Remove infotip positioning event from mapview Map.
  mapview.Map.un('pointermove', position)

  // Just clears the infotip.
  if (!content) return;

  // Creates the infotip node.
  infotip.node = mapp.utils.html.node`<div class="infotip box-shadow">`

  // Assigns the infotip content.
  infotip.node.innerHTML = content

  // Appends the infotip to the mapview.Map.
  mapview.Map.getTargetElement().appendChild(infotip.node)

  // Assign infotip positioning event to mapview.Map.
  mapview.Map.on('pointermove', position)

  // Set the position of the infotip.
  position()

  function position() {

    // The infotip class has a default opacity of 0, with transition effect.
    infotip.node.style.opacity = 1;

    // Set the infotip position from mapview pointerLocation.
    infotip.node.style.left = mapview.pointerLocation.x - infotip.node.offsetWidth / 2 + 'px'
    infotip.node.style.top = mapview.pointerLocation.y - infotip.node.offsetHeight - 15 + 'px'
  }

}