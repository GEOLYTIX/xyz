import hyperHTML from 'hyperhtml/esm';

export const hyper = {
    
  bind: hyperHTML.bind,
  wire: hyperHTML.wire,
  append: function() {
    console.log(arguments);
  }


};
