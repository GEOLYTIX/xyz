module.exports = (function () {

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
        if (typeof(elements) === 'string') {
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
        if (typeof(elements) === 'string') {
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
        if (typeof(elements) === 'string') {
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
        if (typeof(elements) === 'string') {
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
        Object.keys(param).map(function(key){
            if (encodedString.length > 0) encodedString += '&';
            encodedString += encodeURI(key + '=' + param[key]);
        });
        return encodedString;
    }

    function createElement(tag, options, appendTo) {
        let el = document.createElement(tag);

        if (options && typeof options === 'object') Object.keys(options)
            .map(key => el[key] = options[key]);

        if (appendTo) appendTo.appendChild(el);

        return el;
    }

    function _createElement(_el) {
        let el = document.createElement(_el.tag);

        if (_el.options)
            Object.keys(_el.options)
                .map(key => el[key] = _el.options[key]);

        if (_el.appendTo)
            _el.appendTo.appendChild(el);

        if (_el.eventListener)
            el.addEventListener(_el.eventListener.event, _el.eventListener.funct);

        return el;
    }

    function getSelectOptionsIndex(options, value) {
        for (let i=0; i < options.length; i++) {
            if (options[i].value == value) return i;
        }
        return -1;
    }

    function getMath(arr, key, type) {
        let numbers  = arr.filter(function(n){
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
    
    function dataURLToBlob(dataURL){
        let BASE64_MARKER = ';base64,';
        
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            let parts = dataURL.split(','),
                contentType = parts[0].split(':')[1],
                raw = parts[1];
            return new Blob([raw], {type: contentType});
        }
        
        let parts = dataURL.split(BASE64_MARKER),
            contentType = parts[0].split(':')[1],
            raw = window.atob(parts[1]),
            rawLength = raw.length,
            uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
    
    function checkbox(onchange, options){
        let table = createElement('table', {
            className: "checkbox"
        });
        
        let td = createElement('td', {
            className: "box"
        });
        
        let input = createElement('input', {
            id: options.id,
            type: "checkbox"
        });
        
        let label = createElement('label', {
            htmlFor: options.id
        });
        
        let title = createElement('td', {
            textContent: options.label
        }); 
        
        if(options.checked) input.checked = true;

        
        if(typeof(onchange) === 'function'){
            input.addEventListener('change', onchange);
        }
        
        td.appendChild(input);
        td.appendChild(label);
        
        table.appendChild(td);
        table.appendChild(title);
        
        return table;
    }
    

    return {
        scrollElement: scrollElement,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        hasClass: hasClass,
        indexInParent: indexInParent,
        paramString: paramString,
        debounce: debounce,
        createElement: createElement,
        _createElement: _createElement,
        getSelectOptionsIndex: getSelectOptionsIndex,
        getMath: getMath,
        createStatsTable: createStatsTable,
        dataURLToBlob: dataURLToBlob,
        checkbox: checkbox
    };
})();
