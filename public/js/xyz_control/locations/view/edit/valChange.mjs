export default (param) => {

  if(param.input.type === 'checkbox'){

    if(!!param.entry.value !== !!param.input.checked){
      
      param.entry.newValue = param.value || param.input.checked || 'false';
      param.input.parentNode.classList.add('changed');
     
    } else {
      
      delete param.entry.newValue;
      param.input.parentNode.classList.remove('changed');
    }
  
  } else {

    if(!param.entry.value) param.entry.value = '';

    if (param.entry.value.toString() !== param.input.value) {

      param.entry.newValue = param.value || param.input.value || '';
      param.input.classList.add('changed');

    } else {
      delete param.entry.newValue;

    // Change styling of input.
    param.input.classList.remove('changed');
  }
}

if (param.entry.location.showUpload) param.entry.location.showUpload();

}