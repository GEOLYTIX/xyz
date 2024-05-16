mapp.utils.merge(mapp.dictionaries, {
    en: {
        pill_component_remove: "Remove"
    }
});

export default (component = {}) => {

    // Ensure the target is an HTMLElement before proceeding
    if (!(component.target instanceof HTMLElement)) {
        component.target = mapp.utils.html.node`<div>`
    };

    component.container = mapp.utils.html.node`<div class="pill-container">`

    // stores and exposes selected values
    component.pills = new Set(component.pills);

    component.create = function(val) {
        return mapp.utils.html.node`<div
        class="primary-background"
        title="${val}">
        ${val}
        <button
        data-value="${val}"
        title="${mapp.dictionary.pill_component_remove}"
        class="primary-background"
        onclick=${e => {
            // remove pill
            e.target.parentNode.remove();
            // remove pill from selection
            component.pills.delete(val);
            // execute removeCallback if defined
            if(component.removeCallback && typeof component.removeCallback === 'function') component.removeCallback(val, component.pills);
        }}
        >&#10005;`
    }

    component.add = function(val) { 
        if(!val) return;
        if(!component.pills.has(val)) component.pills.add(val); // add to selection
        component.container.append(component.create(val)); // add pill
        // execute add callback if exists
        if(component.addCallback && typeof component.addCallback === 'function') component.addCallback(val, component.pills);
    }

    if(component.pills.size > 0) component.pills.forEach(pill => component.add(pill));

    component.target.append(component.container);

    return component;
  
  };
  

