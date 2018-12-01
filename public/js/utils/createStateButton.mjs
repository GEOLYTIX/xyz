import _xyz from '../_xyz.mjs';

// StateButton factory
export function createStateButton(param){

  const btn = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_state btn_wide cursor noselect',
      textContent: param.text
    },
    appendTo: param.appendTo
  });
  
  btn.activate = () => {
  
    if (_xyz.state.finish) _xyz.state.finish();
    _xyz.state = btn;
    btn.classList.add('active');
    param.activate(param.layer);
  
  };
  
  btn.finish = () => {
  
    _xyz.state = 'select';
    btn.classList.remove('active');
    param.finish(param.layer);
      
  };
  
  btn.addEventListener('click', e => {
  
    e.stopPropagation();
  
    if (_xyz.state === btn) return _xyz.state.finish();
  
    _xyz.state.finish && _xyz.state.finish();
    btn.activate(e);
        
  });
  
}