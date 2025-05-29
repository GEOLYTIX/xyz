export default function popoutDialog(params) {
  if (params.popout?.dialog) {
    params.popout.node.appendChild(mapp.utils.html.node`${params.content}`);

    params.popout.node
      .querySelector('.headerDrag')
      .replaceChildren(
        mapp.utils.html.node`${params.header}${params.popout.closeBtn}`,
      );

    return params.popout.show();
  }

  Object.assign(params.popout, {
    header: params.header,
    data_id: `${params.label}-popout`,
    target: document.getElementById('Map'),
    content: params.content,
    height: 'auto',
    left: '5%',
    top: '0.5em',
    class: 'box-shadow popout',
    css_style: 'width: 300px; height 300px',
    containedCentre: true,
    headerDrag: true,
    closeBtn: true,
    onClose: () => {
      params.containerElement.style.removeProperty('display');

      params.drawer
        .querySelector('.header')
        .replaceChildren(mapp.utils.html.node`${params.header}`);

      params.originalTarget.appendChild(
        mapp.utils.html.node`${params.content}`,
      );

      const beforeElement =
        params.drawer
          .querySelector('.header')
          .querySelector('[data-id="display-toggle"]') ||
        params.drawer.querySelector('.header').querySelector('.caret');

      params.drawer
        .querySelector('.header')
        .insertBefore(params.popoutBtn, beforeElement);
    },
  });

  mapp.ui.elements.dialog(params.popout);
}
