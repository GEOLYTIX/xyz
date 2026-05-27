/**
## /mapview/infotip

@module /mapview/infotip
*/

const infotip = {};

/**
@function Infotip

@description
The method creates an infotip element that follows the pointer location on the mapview. The content of the infotip can be a string, an HTML element, or an object. If the content is an object, a warning will be logged in the console since it cannot be rendered in the infotip. The infotip is removed when the content argument is falsy or when a new infotip is created.

@param {object} params The params object is spread into the interaction defaults.
@param {mapview} mapview The mapview object to which the interaction will be added.
*/
export default function Infotip(content, mapview = this) {
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
