export {default as svg_symbols} from './svg_symbols.mjs';

// Find the index of node in childNodes of parentNode.
export function indexInParent(node) {
    if (!node) return -1;

    let children = node.parentNode.childNodes,
        num = 0;

    for (let i = 0; i < children.length; i++) {
        if (children[i] === node) return num;
        if (children[i].nodeType === 1) num++;
    }
}

// Debounce function.
export function debounce(func, wait) {
    let timeout;

    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            func.apply(this, arguments);
        }, wait);
    };
}

// Create param string for XHR request.
export function paramString(param) {
    let encodedString = '';

    Object.keys(param).forEach(key => {
        if (param[key] && encodedString.length > 0) encodedString += '&';
        if (param[key]) encodedString += encodeURI(key + '=' + param[key]);
    });

    return encodedString;
}

// Function which expands the parent container of an expander element.
export function toggleExpanderParent(params) {

    if (!params.expandedTag) params.expandedTag = 'expanded';
    if (!params.expandableTag) params.expandableTag = 'expandable';

    // Check whether parent is expanded.
    if (params.expandable.classList.contains(params.expandedTag)) {

        // Remove expanded class.
        params.expandable.classList.remove(params.expandedTag);

        // Actualize scrollbar of scrolly element.
        if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);

        return
    }

    // Accordion: Collapse the parents siblings which are expanded.
    if (params.accordeon) {
        [...params.expandable.parentElement.children].forEach(expandable_sibling => {
            expandable_sibling.classList.remove(params.expandedTag);
            if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
        });
    }

    // Add expanded class to expandable element.
    if (params.expandable.classList.contains(params.expandableTag)) {
        params.expandable.classList.add(params.expandedTag);
        if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
    };
}

// Method to apply a left hand scroll bar to a container element.
export function scrolly(el) {

    let track = el.querySelector('.scrolly_track'),
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

        let bar_offsetTop = bar.offsetTop,
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

// Dom element factory.
export function createElement(param) {
    let el = document.createElement(param.tag);

    if (param.options) Object.keys(param.options).map(key => el[key] = param.options[key]);

    if (param.style) Object.keys(param.style).map(key => el.style[key] = param.style[key]);

    if (param.appendTo) param.appendTo.appendChild(el);

    if (param.eventListener) el.addEventListener(param.eventListener.event, param.eventListener.funct);

    return el;
}

// Checkbox factory.
export function checkbox(onchange, options) {

    let checkbox = createElement({
        tag: 'label',
        options: {
            textContent: options.label,
            className: 'checkbox'
        }
    });

    let input = createElement({
        tag: 'input',
        options: {
            type: 'checkbox'
        },
        appendTo: checkbox
    });

    createElement({
        tag: 'div',
        options: {
            className: 'checkbox_i'
        },
        appendTo: checkbox
    });

    if (options.checked) input.checked = true;

    if (typeof (onchange) === 'function') input.addEventListener('change', onchange);

    return checkbox;
}

// Slider factory.
export function slider(options) {

    createElement({
        tag: 'span',
        options: {
            textContent: options.title
        },
        appendTo: options.appendTo
    });

    createElement({
        tag: 'span',
        options: {
            textContent: options.default,
            className: 'bold'
        },
        appendTo: options.appendTo
    });

    let range_div = createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: options.appendTo
    });

    createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: options.min,
            value: options.value,
            max: options.max,
            oninput: options.oninput,
        },
        appendTo: range_div
    });
}

// Create temporary textarea to copy string to clipboard.
export function copyToClipboard(str) {
    let textArea = document.createElement('textarea');
    textArea.style.visibility = 'none';
    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
}



// needs to go into dropdown factory
export function getSelectOptionsIndex(options, value) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == value) return i;
    }

    return -1;
}