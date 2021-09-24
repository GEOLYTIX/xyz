let request = new XMLHttpRequest();

request.open('POST', "https://api.openrouteservice.org/v2/isochrones/driving-car");

request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
request.setRequestHeader('Content-Type', 'application/json');
request.setRequestHeader('Authorization', '5b3ce3597851110001cf6248b6bc71813ade46838b7eac65575775df');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log('Status:', this.status);
    console.log('Headers:', this.getAllResponseHeaders());
    console.log('Body:', this.responseText);
  }
};

const body = '{"locations":[[-0.074773,51.5828338]],"range":[1000]}';

request.send(body);