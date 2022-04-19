export default (fp, scrollParent) => {
  function findScrollParent(candidate) {
    const calcStyle = window.getComputedStyle(candidate);
    if (calcStyle["overflowY"] === "auto" || calcStyle["overflowY"] === "scroll") {
      scrollParent = candidate;
      return;
    }
    candidate.parentElement && findScrollParent(candidate.parentElement);
  }
  !scrollParent && findScrollParent(fp._positionElement.parentElement);
  fp.config.onOpen.push(() => {
    scrollParent.addEventListener("scroll", scrollEvent, {passive: true});
  });
  fp.config.onClose.push(() => {
    scrollParent.removeEventListener("scroll", scrollEvent);
  });
  function scrollEvent() {
    fp._positionCalendar();
  }
};
