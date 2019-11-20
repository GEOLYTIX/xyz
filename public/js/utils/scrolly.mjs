// Method to apply a left hand scroll bar to a container element.
export function scrolly(el) {

  const track = document.createElement('div');
  track.classList = 'scrolly_track';
  el.insertBefore(track, el.firstChild);

  //const bar = el.querySelector('.scrolly_bar');
  const bar = document.createElement('div');
  bar.classList = 'scrolly_bar';
  track.appendChild(bar);

  const setHeight = (function _setHeight() {
    bar.style.height = track.clientHeight * el.clientHeight / el.scrollHeight + 'px';
    bar.style.top = track.clientHeight * el.scrollTop / el.scrollHeight + 'px';
    return _setHeight;
 })();

  el.addEventListener('scrolly', setHeight);

  //let timer;
  el.addEventListener('scroll', () => {
    bar.style.height = track.clientHeight * el.clientHeight / el.scrollHeight + 'px';
    bar.style.top = track.clientHeight * el.scrollTop / el.scrollHeight + 'px';

    clearTimeout(el.dataset.timeout);

    !el.classList.contains('disable-hover') && el.classList.add('disable-hover');

    el.dataset.timeout = setTimeout(function() {
      el.classList.remove('disable-hover');
    }, 500);
  });

  bar.addEventListener('mousedown', e => {

    e.preventDefault();

    const onMove = _e => {
      bar.style.top = Math.min(
        track.clientHeight - bar.clientHeight,
        Math.max(0, bar.offsetTop + _e.pageY - e.pageY)) + 'px';

      el.scrollTop = (el.scrollHeight * bar.offsetTop / track.clientHeight);
    };

    document.addEventListener('mousemove', onMove);

    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMove));
  });

}