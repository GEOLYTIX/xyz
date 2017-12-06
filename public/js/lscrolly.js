module.exports = function(scrolly) {

    let content = scrolly.querySelector('.content'),
        path = scrolly.querySelector('.scrollbar_container'),
        scrollBar = scrolly.querySelector('.scrollbar'),
        scrollEvent = new Event('scroll');

    content.addEventListener('scroll', function () {
        scrollBar.style.height = path.clientHeight * content.clientHeight / content.scrollHeight + 'px';
        scrollBar.style.top = path.clientHeight * content.scrollTop / content.scrollHeight + 'px';
    });

    window.addEventListener('resize', content.dispatchEvent.bind(content, scrollEvent));
    content.dispatchEvent(scrollEvent);

    scrollBar.addEventListener('mousedown', function (eDown) {
        eDown.preventDefault();
        let scrollBar_offsetTop = scrollBar.offsetTop,
            eDown_pageY = eDown.pageY,
            onMove = function (eMove) {
                scrollBar.style.top = Math.min(
                        path.clientHeight - scrollBar.clientHeight,
                        Math.max(
                            0,
                            scrollBar_offsetTop + eMove.pageY - eDown_pageY
                        )
                    ) + 'px';
                content.scrollTop = (content.scrollHeight * scrollBar.offsetTop / path.clientHeight);
            };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', onMove);
        });
    });

};