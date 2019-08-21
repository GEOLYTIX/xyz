// StateButton factory
export function createStateButton(_xyz, param){

  const btn = _xyz.utils.wire()`<div class="btn_state btn_wide cursor noselect">${param.text}`;

  param.appendTo.appendChild(btn);
  
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
  
  btn.onclick = e => {
  
    e.stopPropagation();
  
    if (_xyz.mapview.state === btn) return _xyz.mapview.state.finish();
  
    _xyz.mapview.state.finish && _xyz.mapview.state.finish();

    btn.activate(e);
        
  };
  
}