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

// Dom element factory.
export function createElement(param) {
    let el = document.createElement(param.tag);

    if (param.options) Object.keys(param.options).forEach(key => el[key] = param.options[key]);

    if (param.style) Object.keys(param.style).forEach(key => el.style[key] = param.style[key]);

    if (param.appendTo) param.appendTo.appendChild(el);

    if (param.eventListener) el.addEventListener(param.eventListener.event, param.eventListener.funct);

    return el;
}

// Checkbox factory.
export function checkbox(onchecked, param) {

    let checkbox = createElement({
        tag: 'label',
        options: {
            textContent: param.label,
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

    if (param.checked) input.checked = true;

    if (typeof (onchecked) === 'function') input.addEventListener('change', onchange);

    return checkbox;
}

export function _checkbox(param) {

    let checkbox = createElement({
        tag: 'label',
        options: {
            textContent: param.label,
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

    if (param.checked) input.checked = true;

    if (typeof (onchecked) === 'function') input.addEventListener('change', onchange);
}

// Slider factory.
export function slider(param) {

    createElement({
        tag: 'span',
        options: {
            textContent: param.title
        },
        appendTo: param.appendTo
    });

    createElement({
        tag: 'span',
        options: {
            textContent: param.default,
            className: 'bold'
        },
        appendTo: param.appendTo
    });

    let range_div = createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: param.appendTo
    });

    createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: param.min,
            value: param.value,
            max: param.max,
            oninput: param.oninput,
        },
        appendTo: range_div
    });
}

export function dropdown(param) {

    if (param.title) createElement({
        tag: 'div',
        options: {
            textContent: param.title
        },
        appendTo: param.appendTo
    });

    let select = createElement({
        tag: 'select',
        appendTo: param.appendTo
    });

    if (param.entries.length) {

        // Create select options from entries Array.
        param.entries.forEach(entry => {
            createElement({
                tag: 'option',
                options: {
                    // Assign first value as text if entry is object.
                    textContent: typeof (entry) == 'object' ? Object.values(entry)[0] : entry,
                    // Assign first key as value if entry is object.
                    value: typeof (entry) == 'object' ? Object.keys(entry)[0] : entry
                },
                appendTo: select
            })
        });

    } else {

        // Create select options from Object if length is undefined.
        Object.keys(param.entries).forEach(entry => {
            createElement({
                tag: 'option',
                options: {
                    textContent: param.entries[entry][param.label] || entry,
                    value: param.entries[entry][param.val] || entry
                },
                appendTo: select
            })
        });
    }

    select.disabled = (select.childElementCount === 1);

    select.onchange = param.onchange;

    select.selectedIndex = getSelectOptionsIndex(select, param.selected);

    // Get the index of the selected option from the select element.
    function getSelectOptionsIndex(select, value) {
        if (!value) return 0;
        
        for (let i = 0; i < select.length; i++) {
            if (select[i].value == value) return i;
        }
    
        return -1;
    }
}