export default (layer, filter_entry) => {

	filter_entry.el.parentNode.removeChild(filter_entry.el);
    filter_entry.el = null;
    if(!layer.filter.list.children.length) layer.filter.clear_all.style.display = 'none';

}
