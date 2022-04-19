import Chart from './Chart.mjs'

import Tabulator from './Tabulator.mjs'

import idleMask from './idleMask.mjs'

import imagePreview from './imagePreview.mjs'

import resizeHandler from './resizeHandler.mjs'

export default {
  Chart,
  Tabulator,
  idleMask,
  imagePreview,
  resizeHandler,
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

function scrollDialog(fp, scrollParent) {

  function findScrollParent(candidate){
    
    const calcStyle = window.getComputedStyle(candidate)
    
    if (calcStyle['overflowY'] === 'auto' || calcStyle['overflowY'] === 'scroll') {
      scrollParent = candidate;
      return;
    }
    
    candidate.parentElement && findScrollParent(candidate.parentElement)
  }
  
  !scrollParent && findScrollParent(fp._positionElement.parentElement)

  fp.config.onOpen.push(() => {
    scrollParent.addEventListener("scroll", scrollEvent, { passive: true });
  });

  fp.config.onClose.push(() => {
    scrollParent.removeEventListener("scroll", scrollEvent);
  });

  function scrollEvent() {
    fp._positionCalendar();
  }
}