export function hexToRGBA(hex, opacity) {
  
  let rgb = (function(res) {

    if(res) return (function(parts) {
        
      return parts;
        
    }(res.slice(1,4).map(function(val) { return parseInt(val, 16); })));
      
  }(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)));

  return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`: '';
    
}