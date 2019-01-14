import _xyz from '../_xyz.mjs';

export default () => {
    
  let thresholdSet = [];

  for (let i=0; i<=1.0; i+= 0.01) {
    thresholdSet.push(i);
  }

  let holder = document.querySelector('.tableview .tabs .content-wrap .table-preholder');// .content-wrap .content-current'); //.content-wrap');

  let observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: thresholdSet
  };

  let observer = new IntersectionObserver(intersectionCallback, observerOptions);

  observer.observe(holder);
  //observer.observe(wrapper.querySelector('.content-wrap .content-current'));
  //observer.observe(wrapper.querySelector('.tabulator'));
  //observer.observe(layer.tableview.container);
    
};

function intersectionCallback(entries){
  let preholder = document.querySelector('.tableview .tabs .content-wrap .table-preholder'),
    holder = document.querySelector('.tableview .tabs .content-wrap .table-holder');// .content-wrap .content-current'); //.content-wrap');


  entries.forEach(entry => {
    let visiblePct = (Math.floor(entry.intersectionRatio * 100)) + '%';
    let pct = entry.intersectionRatio;//Math.floor(entry.intersectionRatio*100);

    console.log(pct);
    console.log(_xyz.tableview.height);

    if(pct === 0){
      Object.values(_xyz.layers.list).map(layer => {
        if(layer.tableview && layer.tableview.holder && layer.tableview.table) {
          //layer.tableview.holder.style.height = '30vh';
          _xyz.tableview.height = '30vh';
          layer.tableview.holder.style.height = _xyz.tableview.height;
          layer.tableview.container.style.height = _xyz.tableview.height;
        }
      });
    }
    if(pct > 0.3){
      Object.values(_xyz.layers.list).map(layer => {
        if(layer.tableview && layer.tableview.holder && layer.tableview.table) {
          //layer.tableview.holder.style.height = Math.floor(preholder.clientHeight*pct) + 'px';
          //layer.tableview.table.redraw();
          _xyz.tableview.height = Math.floor(preholder.clientHeight*pct) + 'px';
          layer.tableview.holder.style.height = _xyz.tableview.height;
          layer.tableview.container.style.height = _xyz.tableview.height;
          //_xyz.tableview.refresh(layer);
          console.log(layer.tableview.holder.style.height);
        }
      });
    }
        
  });
}