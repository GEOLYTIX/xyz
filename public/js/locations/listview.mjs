export default _xyz => {

  return {

    init: init,

    add: add

  };


  function init(params) {

    _xyz.locations.listview.callbackAdd = _xyz.locations.listview.callbackAdd || params.callbackAdd;

    _xyz.locations.listview.callbackInit = _xyz.locations.listview.callbackInit || params.callbackInit;
  
    _xyz.locations.listview.node = _xyz.locations.listview.node || params.target;
   
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';

    _xyz.locations.list = [
      ['#9c27b0','invert(22%) sepia(80%) saturate(1933%) hue-rotate(272deg) brightness(97%) contrast(104%)'],
      ['#2196f3','invert(60%) sepia(94%) saturate(3876%) hue-rotate(184deg) brightness(98%) contrast(94%)'],
      ['#009688','invert(37%) sepia(46%) saturate(1993%) hue-rotate(144deg) brightness(96%) contrast(101%)'],
      ['#cddc39','invert(84%) sepia(82%) saturate(420%) hue-rotate(6deg) brightness(88%) contrast(94%)'],
      ['#ff9800','invert(59%) sepia(90%) saturate(1526%) hue-rotate(358deg) brightness(99%) contrast(106%)'],
      ['#673ab7','invert(23%) sepia(26%) saturate(6371%) hue-rotate(251deg) brightness(87%) contrast(87%)'],
      ['#03a9f4','invert(65%) sepia(61%) saturate(5963%) hue-rotate(168deg) brightness(101%) contrast(103%)'],
      ['#4caf50','invert(65%) sepia(8%) saturate(3683%) hue-rotate(73deg) brightness(92%) contrast(69%)'],
      ['#ffeb3b','invert(75%) sepia(76%) saturate(391%) hue-rotate(2deg) brightness(104%) contrast(109%)'],
      ['#ff5722','invert(47%) sepia(96%) saturate(3254%) hue-rotate(346deg) brightness(100%) contrast(102%)'],
      ['#0d47a1','invert(15%) sepia(99%) saturate(2827%) hue-rotate(213deg) brightness(87%) contrast(90%)'],
      ['#00bcd4','invert(60%) sepia(39%) saturate(2788%) hue-rotate(144deg) brightness(93%) contrast(102%)'],
      ['#8bc34a','invert(87%) sepia(8%) saturate(3064%) hue-rotate(35deg) brightness(85%) contrast(85%)'],
      ['#ffc107','invert(79%) sepia(86%) saturate(3969%) hue-rotate(346deg) brightness(98%) contrast(111%)'],
      ['#d32f2f','invert(28%) sepia(94%) saturate(3492%) hue-rotate(345deg) brightness(85%) contrast(92%)']
    ].map(colorFilter => ({
      style: {
        strokeColor: colorFilter[0]
      },
      colorFilter: colorFilter[1]
    }));

    _xyz.locations.listview.callbackInit && _xyz.locations.listview.callbackInit();
         
  };


  function add(location) {

    if(!_xyz.locations.listview.node) return;
  
    Object.values(_xyz.locations.listview.node.children).forEach(el => el.classList.remove('expanded'));
     
    _xyz.locations.listview.node.insertBefore(location.view, _xyz.locations.listview.node.firstChild);

    setTimeout(
      () => {
      const scrolly = _xyz.locations.listview.node.closest('.scrolly');
      scrolly && scrolly.dispatchEvent(new CustomEvent('scrolly'));
      location.view.style.maxHeight = location.view.querySelector('.header').offsetHeight + 'px';
      }, 500);
  
    _xyz.locations.listview.callbackAdd && _xyz.locations.listview.callbackAdd();

  }

};