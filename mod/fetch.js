const fetch = require('node-fetch');

module.exports = async (url, no_log) => {

  try {
    const response = await fetch(url);
    return await response.json();
    
  } catch (err) {

    // Return status 200 if fetch succeeded but not JSON.
    if (err.type === 'invalid-json') return {status: 200};

    Object.keys(err).forEach(key => !err[key] && delete err[key]);
    if (!no_log) console.error(err);
    return {_err: 'Fetch from reessource failed.'};
  }

};