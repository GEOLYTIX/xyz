module.exports = {
    scrollElement,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    indexInParent,
    paramString,
    debounce,
    createElement,
    _createElement,
    getSelectOptionsIndex,
    getMath,
    createStatsTable,
    dataURLToBlob,
    checkbox,
    toggleExpanderParent,
    rgbToHex,
    clone,
    get_index_by_value,
    scrolly,
    slider,
    copy_to_clipboard,
    wrap
}

function scrollElement(element, to, duration) {
    if (duration <= 0) return;

    let difference = to - element.scrollTop,
        perTick = difference / duration * 10;

    setTimeout(function () {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollElement(element, to, duration - 10);
    }, 10);
}

function addClass(elements, myClass) {
    if (!elements) return;

    // if we have a selector, get the chosen elements
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    } else if (elements.tagName) {
        elements = [elements];
    }

    // add class to all chosen elements
    for (let i = 0; i < elements.length; i++) {
        if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') < 0) elements[i].className += ' ' + myClass;
    }
}

function removeClass(elements, myClass) {
    if (!elements) return;

    // if we have a selector, get the chosen elements
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    } else if (elements.tagName) {
        elements = [elements];
    }

    // create pattern to find class name
    let reg = new RegExp('(^| )' + myClass + '($| )', 'g');

    // remove class from all chosen elements
    for (let i = 0; i < elements.length; i++) {
        elements[i].className = elements[i].className.replace(reg, ' ');
    }
}

function toggleClass(elements, myClass) {
    if (!elements) return;

    // if we have a selector, get the chosen elements
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    } else if (elements.tagName) {
        elements = [elements];
    }

    // create pattern to find class name
    let reg = new RegExp('(^| )' + myClass + '($| )', 'g');

    for (let i = 0; i < elements.length; i++) {
        if (elements[i] && (' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') > 0) {
            elements[i].className = elements[i].className.replace(reg, ' ');
        } else if (elements[i]) {
            elements[i].className += ' ' + myClass;
        }
    }
}

function hasClass(elements, myClass) {
    if (!elements) return;

    // if we have a selector, get the chosen elements
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    } else if (elements.tagName) {
        elements = [elements];
    }

    // add class to all chosen elements
    let n = 0;
    for (let i = 0; i < elements.length; i++) {
        if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') > 0) n++;
    }

    return n === elements.length;
}

function indexInParent(node) {
    if (node) {
        let children = node.parentNode.childNodes,
            num = 0;
        for (let i = 0; i < children.length; i++) {
            if (children[i] === node) return num;
            if (children[i].nodeType === 1) num++;
        }
    }
    return -1;
}

function debounce(func, wait) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            func.apply(this, arguments);
        }, wait);
    };
}

function paramString(param) {
    let encodedString = '';
    Object.keys(param).forEach(key => {
        if (param[key] && encodedString.length > 0) encodedString += '&';
        if (param[key]) encodedString += encodeURI(key + '=' + param[key]);
    });
    return encodedString;
}

function createElement(tag, options, appendTo) {
    let el = document.createElement(tag);

    if (options && typeof options === 'object')
        Object.keys(options)
            .map(key => el[key] = options[key]);

    if (appendTo) appendTo.appendChild(el);

    return el;
}

function _createElement(_el) {
    let el = document.createElement(_el.tag);

    if (_el.options)
        Object.keys(_el.options)
            .map(key => el[key] = _el.options[key]);

    if (_el.style)
        Object.keys(_el.style)
            .map(key => el.style[key] = _el.style[key]);

    if (_el.appendTo)
        _el.appendTo.appendChild(el);

    if (_el.eventListener)
        el.addEventListener(_el.eventListener.event, _el.eventListener.funct);

    return el;
}

function getSelectOptionsIndex(options, value) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == value) return i;
    }
    return -1;
}

function getMath(arr, key, type) {
    let numbers = arr.filter(function (n) {
        if (isFinite(n[key])) return n[key]
    });

    return Math[type].apply(null, numbers.map(function (val) {
        return val[key]
    }))
}

function createStatsTable(infoj) {
    let table = '';
    Object.keys(infoj).map(function (key) {
        //typeof (infoj[key]) === 'object' ?
        //statsTableGroup(infoj, key, 'title') :
        table += '<tr><td class="lv-0">' + key + '</td><td class="val">' + infoj[key].toLocaleString('en-GB') + '</td></tr>';
    });
    return table;
}

function dataURLToBlob(dataURL) {
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

function toggleExpanderParent(params) {
    
    if(!params.expandedTag) params.expandedTag = 'expanded';
    if(!params.expandableTag) params.expandableTag = 'expandable';

    // Check whether parent is expanded.
    if (hasClass(params.expandable, params.expandedTag)) {

        // Remove expanded class.
        removeClass(params.expandable, params.expandedTag);

        // Actualize scrollbar of scrolly element.
        if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
        return
    }

    // Accordion: Collapse the parents siblings which are expanded.
    if (params.accordeon) {
        [...params.expandable.parentElement.children].forEach(expandable_sibling => {
            removeClass(expandable_sibling, params.expandedTag);
            if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
        });
    }

    // Add expanded class to expandable element.
    if (hasClass(params.expandable, params.expandableTag)) {
        addClass(params.expandable, params.expandedTag);
        if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
    };
}

function scrolly(el) {

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

function checkbox(onchange, options) {

    let checkbox = _createElement({
        tag: 'label',
        options: {
            textContent: options.label,
            className: 'checkbox'
        }
    });

    let input = _createElement({
        tag: 'input',
        options: {
            type: 'checkbox'
        },
        appendTo: checkbox
    });

    _createElement({
        tag: 'div',
        options: {
            className: 'checkbox_i'
        },
        appendTo: checkbox
    });

    if (options.checked) input.checked = true;

    if (typeof (onchange) === 'function')
        input.addEventListener('change', onchange);

    return checkbox;
}

function slider(options) {

    _createElement({
        tag: 'span', 
        options: {
            textContent: options.title
        }, 
        appendTo: options.appendTo
    });

    _createElement({
        tag: 'span', 
        options: {
            textContent: options.default,
            className: "bold"
        }, 
        appendTo: options.appendTo
    });

    let range_div = _createElement({
        tag: 'div', 
        options: {
            className: "range"
        },
        appendTo: options.appendTo
    });

    _createElement({
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

function rgbToHex(color) {

    let hexDigits = new Array
        ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

    function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }

    if (color.substr(0, 1) === '#') {
        return color;
    } else {
        color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + hex(color[1]) + hex(color[2]) + hex(color[3]);
    }
}

function clone(_obj) {
    let _clone;
    _obj instanceof Array ? _clone = [] : _clone = {};
    Object.keys(_obj).map(function (key) {
        _clone[key] = _obj[key];
    });
    return _clone;
}

function get_index_by_value(json_arr, key, val) {
    return json_arr.findIndex((item) => {
        return item.hasOwnProperty(key) && item[key] === val;
    });
}

function copy_to_clipboard(str) {
    let textArea = document.createElement("textarea");
    textArea.style.visibility = 'none';
    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
}

function wrap(text, width) { // wraps svg text
    text.each(function () {
        let
            text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 1.1,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}
