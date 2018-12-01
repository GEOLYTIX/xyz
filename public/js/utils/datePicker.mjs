import datepicker from 'js-datepicker';

export function datePicker(element, record, entry, callback){

  // Create datepicker for input element.
  datepicker(element, {
    //position: 'tl',
    position: 'c',
    formatter: (input, date) => {
          
      let
        _d = meltDateStr(new Date(date)),
        dateStr;
          
      if(entry.type === 'date') dateStr = formatDate(_d);

      if(entry.type === 'datetime') dateStr = formatDateTime(_d);
  
      input.value = dateStr;
    },
    onSelect: (instance, date) => {
  
      // return if callback is passed to datepicker, e.g. apply filter function.
      if(callback) return callback();
  
      const timestamp = meltDateStr(date);
  
      if (!entry.value) entry.value = '';
  
      // Create newValue if input value is different from entry value.
      if (entry.value !== timestamp) {
        
        entry.newValue = timestamp;
        
        // Change styling of input and display upload button.
        record.upload.style.display = 'block';
        instance.el.classList.add('changed');
    
      } else {
        
        // Delete newValue if it is the same as the entry value.
        delete entry.newValue;
        
        // Change styling of input.
        instance.el.classList.remove('changed');
        
        // Hide upload button if no other field in the infoj has a newValue.
        if (!record.location.infoj.some(field => field.newValue)) record.upload.style.display = 'none';
      } 

    },
    onShow: instance => {
   
      const yPosition = instance.el.getBoundingClientRect().top;

      instance.calendar.style.top = (yPosition - 100) + 'px';

    }
  });

}

// from beautiful string to bigint format
export function meltDateStr(str){ 
  return Math.round((new Date(str)).getTime() / 1000);
}

export function formatDate(unix_timestamp){

  if(isNaN(parseInt(unix_timestamp))) return ' ';
    
  let
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    d = new Date(unix_timestamp*1000),
    year = d.getFullYear(),
    month = months[d.getMonth()],
    day = d.getDate(),
    weekday = days[d.getDay()];
    
  return `${weekday} ${day} ${month} ${year}`;
}
  
export function formatDateTime(unix_timestamp){
  
  if(isNaN(parseInt(unix_timestamp))) return ' ';
      
  let
    dateStr = formatDate(unix_timestamp),
    d = new Date(unix_timestamp*1000),
    h = d.getHours(),
    min = '0' + d.getMinutes(),
    sec = '0' + d.getSeconds();
    
  return `${dateStr}, ${h}:${min.substr(-2)}:${sec.substr(-2)}`;
}