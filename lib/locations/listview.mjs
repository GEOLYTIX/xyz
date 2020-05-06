export default _xyz => {

  const listview = {
    init: init,
  };

  return listview;


  function init(params) {

    listview.add = add;

    listview.callbackAdd = listview.callbackAdd || params.callbackAdd;

    listview.callbackInit = listview.callbackInit || params.callbackInit;

    listview.node = listview.node || params.target;

    listview.node.innerHTML = '';

    _xyz.locations.list = [
      ['#4227b0','invert(19%) sepia(57%) saturate(4245%) hue-rotate(247deg) brightness(76%) contrast(101%)'],
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

    listview.callbackInit && listview.callbackInit();

  };


  function add(location) {

    if(!listview.node) return;

    Object.values(listview.node.children).forEach(el => el.classList.remove('expanded'));

    listview.node.insertBefore(location.view, listview.node.firstChild);

    location.view.style.maxHeight = '30px';

    listview.callbackAdd && listview.callbackAdd();

  }

};