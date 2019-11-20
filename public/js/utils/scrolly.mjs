// Method to apply a left hand scroll bar to a container element.
export function scrolly(el) {

  let
    track = el.querySelector('.scrolly_track'),
    bar = el.querySelector('.scrolly_bar');

  bar.style.height = track.clientHeight * el.clientHeight / el.scrollHeight + 'px';
  bar.style.top = track.clientHeight * el.scrollTop / el.scrollHeight + 'px';

  // Update the bar when the scrolly element is scrolled.
  el.addEventListener('scroll', () => {
    bar.style.height = track.clientHeight * el.clientHeight / el.scrollHeight + 'px';
    bar.style.top = track.clientHeight * el.scrollTop / el.scrollHeight + 'px';
  });

  // Event when the bar is clicked.
  bar.addEventListener('mousedown', e => {

    e.preventDefault();

    let
      bar_offsetTop = bar.offsetTop,
      e_pageY = e.pageY;

    // Update the scroll position of scrolly element and the position of the bar when mouse is moved in y direction.
    let onMove = e => {
      bar.style.top = Math.min(
        track.clientHeight - bar.clientHeight,
        Math.max(0, bar_offsetTop + e.pageY - e_pageY)) + 'px';

      el.scrollTop = (el.scrollHeight * bar.offsetTop / track.clientHeight);
    };

    document.addEventListener('mousemove', onMove);

    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMove));
  });

}