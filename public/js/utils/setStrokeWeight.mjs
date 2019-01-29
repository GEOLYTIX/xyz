export function setStrokeWeight(param){
  if(!param.style) return;
  let width;
  switch(param.style.width){
  case '1': width = 'thin'; break;
  case '2': width = 'medium'; break;
  case parseInt(param.style.width) > 2: width = 'thick'; break;
  }
  return width;
}