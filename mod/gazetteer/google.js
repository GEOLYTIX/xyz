module.exports = async (term, gazetteer) => {

  //https://developers.google.com/places/web-service/autocomplete

  // Create url decorated with gazetteer options.
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${term}`
          + `${gazetteer.code ? '&components=country:' + gazetteer.code : ''}`
          + `${gazetteer.bounds ? '&' + decodeURIComponent(gazetteer.bounds) : ''}`
          + `&${global.KEYS.GOOGLE}`;

  // Fetch results from Google maps places API.
  const fetched = await require(global.appRoot + '/mod/fetch')(url);

  if (fetched._err) return fetched;
    
  // Return results to route. Zero results will return an empty array.
  return await fetched.predictions.map(f => ({
    label: f.description,
    id: f.place_id,
    source: 'google'
  }));

};