export default (_xyz, params) => {

  if (!params.btn) return;

  return {
    toggleTableview: toggleTableview(params),
  };

  function toggleTableview(params) {

    if (!params.btn.toggleTableview) return;

    params.btn.toggleTableview.onclick = () => {

      _xyz.tableview.node.style.transition = 'height 0.2s ease-out';

      setTimeout(()=>_xyz.tableview.node.style.transition = 'none', 200);
  
      if (params.btn.toggleTableview.textContent === 'vertical_align_bottom') {
  
        params.btn.toggleTableview.textContent = 'vertical_align_top';
        _xyz.tableview.node.style.height = '40px';
        return;
  
      }
  
      params.btn.toggleTableview.textContent = 'vertical_align_bottom';
      _xyz.tableview.node.style.height = window.innerHeight + 'px';

    };

  }
  
};