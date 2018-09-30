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

export function createElement(_el) {
    let el = document.createElement(_el.tag);

    if (_el.options) Object.keys(_el.options).map(key => el[key] = _el.options[key]);

    if (_el.style) Object.keys(_el.style).map(key => el.style[key] = _el.style[key]);

    if (_el.appendTo) _el.appendTo.appendChild(el);

    if (_el.eventListener) el.addEventListener(_el.eventListener.event, _el.eventListener.funct);

    return el;
}

export function getSelectOptionsIndex(options, value) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == value) return i;
    }

    return -1;
}

export function getMath(arr, key, type) {
    let numbers = arr.filter(function (n) {
        if (isFinite(n[key])) return n[key]
    });

    return Math[type].apply(null, numbers.map(function (val) {
        return val[key]
    }))
}

export function createStatsTable(infoj) {
    let table = '';
    Object.keys(infoj).map(function (key) {
        table += '<tr><td class="lv-0">' + key + '</td><td class="val">' + infoj[key].toLocaleString('en-GB') + '</td></tr>';
    });

    return table;
}

export function dataURLToBlob(dataURL) {
    let BASE64_MARKER = ';base64,';

    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        let parts = dataURL.split(','),
            contentType = parts[0].split(':')[1],
            raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    let parts = dataURL.split(BASE64_MARKER),
        contentType = parts[0].split(':')[1],
        raw = window.atob(parts[1]),
        rawLength = raw.length,
        uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

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

export function scrolly(el) {

    //let content = scrolly.querySelector('.scrolly'),
    let track = el.querySelector('.scrolly_track'),
        bar = el.querySelector('.scrolly_bar'),
        scrollEvent = new Event('scroll');

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
            className: "bold"
        },
        appendTo: options.appendTo
    });

    let range_div = createElement({
        tag: 'div',
        options: {
            className: "range"
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

export function rgbToHex(color) {
    let hexDigits = new Array
        ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

    if (color.substr(0, 1) === '#') return color;

    color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(color[1]) + hex(color[2]) + hex(color[3]);

    function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }
}

export function clone(obj) {
    let clone;
    obj instanceof Array ? clone = [] : clone = {};
    Object.keys(obj).map(function (key) {
        clone[key] = obj[key];
    });
    return clone;
}

export function get_index_by_value(json_arr, key, val) {
    return json_arr.findIndex((item) => {
        return item.hasOwnProperty(key) && item[key] === val;
    });
}

export function copy_to_clipboard(str) {
    let textArea = document.createElement("textarea");
    textArea.style.visibility = 'none';
    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
}