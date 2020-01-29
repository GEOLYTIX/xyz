const env = require('../env');
const fetch = require('../fetch');

module.exports = async (term, gazetteer) => {

	const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(term)}` 
	+ `${gazetteer.code ? `&countrycode=${gazetteer.code}` : ''}`
	+ `${gazetteer.bounds ? '&bounds=' + decodeURIComponent(gazetteer.bounds) : ''}`
	+ `&key=${env.keys.OPENCAGE}`;

	const fetched = await fetch(url);

	if (fetched._err) return fetched;

	return await fetched.results.map(f => ({
		id: f.annotations.geohash,
		label: f.formatted,
		marker: [f.geometry.lng, f.geometry.lat],
		source: 'opencage'
  }));
}