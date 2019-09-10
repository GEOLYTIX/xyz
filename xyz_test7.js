(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(name, definition);
  else context[name] = definition();
}('xyz', this, function () {
  
  return function xyz(_alert,_log) {

    alert(_alert);
    console.log(_log);
    
  };
}));
