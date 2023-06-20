function extractRemoteAddress(req) {
    return /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'] 
      : 'unknown';
  }
  
  module.exports = extractRemoteAddress;