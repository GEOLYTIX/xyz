import _flatpickr from "flatpickr";

export function flatpickr(params) {

  return _flatpickr(params.element, {

    defaultDate: params.value,
    enableTime: params.enableTime || false,
    time_24hr: true,
    dateFormat: params.enableTime ? "j M Y H:i" : "j M Y",
    onClose: (selectedDates, dateStr, instance) => {
      params.callback(dateStr);
    }
  
  });
}

// from beautiful string to bigint format
export function meltDateStr(str){ 
  return Math.round((new Date(str)).getTime() / 1000);
}

export function formatDate(unix_timestamp){

  if (!unix_timestamp) return;

  // this line checks if unix_timestamp is a table cell object
  unix_timestamp = parseInt(unix_timestamp) ?  unix_timestamp : unix_timestamp.getValue();

  if(isNaN(parseInt(unix_timestamp))) return ' ';
    
  let
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    d = new Date(unix_timestamp*1000),
    year = d.getFullYear(),
    month = months[d.getMonth()],
    day = d.getDate(),
    weekday = days[d.getDay()];
    
  //return `${weekday} ${day} ${month} ${year}`;
  return `${day} ${month} ${year}`;
}
  
export function formatDateTime(unix_timestamp){

  if (!unix_timestamp) return;

  // this line checks if unix_timestamp is a table cell object
  unix_timestamp = parseInt(unix_timestamp) ?  unix_timestamp : unix_timestamp.getValue();
  
  if(isNaN(parseInt(unix_timestamp))) return ' ';
      
  let
    dateStr = formatDate(unix_timestamp),
    d = new Date(unix_timestamp*1000),
    h = '0' + d.getHours(),
    min = '0' + d.getMinutes(),
    sec = '0' + d.getSeconds();
    
  //return `${dateStr}, ${h}:${min.substr(-2)}:${sec.substr(-2)}`;
  return `${dateStr}, ${h.substr(-2)}:${min.substr(-2)}`;
}