/**
## Mapview.infotip()

@module /mapview/infotip

@param {Object} content
*/

const infotip = {};

export default function (content) {
  const mapview = this;

  // Remove infotip node element
  infotip.node?.remove();

  // The mapview must have a position to place the infotip.
  if (!mapview.position) return;

  // Remove infotip positioning event from mapview Map.
  mapview.Map.un('pointermove', position);

  // Just clears the infotip.
  if (!content) return;

  if (content instanceof HTMLElement) {
    infotip.node = content;

    // Content type object but not HTMLElement cannot be rendered.
  } else if (typeof content === 'object') {
    console.warn(
      `Content type object cannot be rendered in infotip: ${JSON.stringify(content)}`,
    );
    return;
  } else {
    // Check for braces in content string.
    if (mapview.locale.xss_check && /[()]/.test(content)) {
      console.warn(`Potential XSS detected in infotip content ${content}`);
    }

    // Creates the infotip node.
    infotip.node = mapp.utils.html.node`<div class="infotip box-shadow">`;

    // Assigns the infotip content.
    infotip.node.innerHTML = content;
  }

  // Appends the infotip to the mapview.Map.
  mapview.Map.getTargetElement().append(infotip.node);

  // Assign infotip positioning event to mapview.Map.
  mapview.Map.on('pointermove', position);

  // Set the position of the infotip.
  position();

  function position() {
    // The infotip class has a default opacity of 0, with transition effect.
    infotip.node.style.opacity = 1;

    // Set the infotip position from mapview pointerLocation.
    infotip.node.style.left =
      mapview.pointerLocation.x - infotip.node.offsetWidth / 2 + 'px';
    infotip.node.style.top =
      mapview.pointerLocation.y - infotip.node.offsetHeight - 15 + 'px';
  }
}
