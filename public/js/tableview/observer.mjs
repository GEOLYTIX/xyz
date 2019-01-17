export default _xyz => {
    
  if(_xyz.tableview.observer) _xyz.tableview.observer.disconnect();
    
  let thresholdSet = [];
    
  for (let i=0; i<=1.0; i+= 0.01) {
    thresholdSet.push(i);
  }
    
  let preholder = document.querySelector('.tableview .tabs .content-wrap .content-current .table-preholder');
    
  let observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: thresholdSet
  };
    
  _xyz.tableview.observer = new IntersectionObserver(intersectionCallback, observerOptions);
  
  _xyz.tableview.observer.observe(preholder);

  function intersectionCallback(entries){
    let preholder = document.querySelector('.tableview .tabs .content-wrap .content-current .table-preholder');
  
    entries.forEach(entry => {
      let pct = parseFloat(entry.intersectionRatio);
      
      _xyz.tableview.height = pct ? Math.floor(preholder.clientHeight*pct) + 'px' : '30vh';
  
      console.log({ /* test */
        pct: pct,
        height: _xyz.tableview.height
      });
  
  
      if(pct === 0){
        Object.values(_xyz.layers.list).map(layer => {
          if(layer.tableview && layer.tableview.holder && layer.tableview.table) {
            layer.tableview.holder.style.height = _xyz.tableview.height;
            layer.tableview.container.style.height = _xyz.tableview.height;
          }
        });
      }
      if(pct > 0.3){
        Object.values(_xyz.layers.list).map(layer => {
          if(layer.tableview && layer.tableview.holder && layer.tableview.table) {
            layer.tableview.holder.style.height = _xyz.tableview.height;
            layer.tableview.container.style.height = _xyz.tableview.height;
          }
        });
      }
    });
  }

};