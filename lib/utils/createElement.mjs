// Dom element factory.
export function createElement(param) {

  let el = document.createElement(param.tag);

  if (param.options) Object.keys(param.options).forEach(key => {
    if (param.options[key]) el[key] = param.options[key];
  });

  if (param.style) Object.keys(param.style).forEach(key => el.style[key] = param.style[key]);

  if (param.appendTo) param.appendTo.appendChild(el);

  if (param.eventListener) el.addEventListener(param.eventListener.event, param.eventListener.funct);

  return el;

}