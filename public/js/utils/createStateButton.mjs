// StateButton factory
export function createStateButton(_xyz, param){

  const btn = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_state btn_wide cursor noselect',
      textContent: param.text
    },
    appendTo: param.appendTo
  });
  
  btn.activate = () => {
  
    if (_xyz.mapview.state.finish) _xyz.mapview.state.finish();
    _xyz.mapview.state = btn;
    btn.classList.add('active');
    param.activate(param.layer);
  
  };
  
  btn.finish = () => {
  
    _xyz.mapview.state = 'select';
    btn.classList.remove('active');
    param.finish(param.layer);
      
  };
  
  btn.addEventListener('click', e => {
  
    e.stopPropagation();
  
    if (_xyz.mapview.state === btn) return _xyz.mapview.state.finish();
  
    _xyz.mapview.state.finish && _xyz.mapview.state.finish();
    btn.activate(e);
        
  });
  
}