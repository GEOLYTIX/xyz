/**
## ui/utils/resizeHandler

@module /ui/utils/resizeHandler
*/

export default (params) => {
  params.target.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', params.resizeEvent);
    window.addEventListener('mouseup', stopResize);
  });

  params.target.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      window.addEventListener('touchmove', params.resizeEvent);
      window.addEventListener('touchend', stopResize);
    },
    {
      passive: true,
    },
  );

  // Remove vertical resize events.
  function stopResize() {
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', params.resizeEvent);
    window.removeEventListener('touchmove', params.resizeEvent);
    window.removeEventListener('mouseup', stopResize);
    window.removeEventListener('touchend', stopResize);
  }
};
