//This function is to replicate the remote address regex expression on line 87 of mod/user/login.js 
// & line 37 of mod/user/register.js

function extractRemoteAddress(req) {
    return /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'] 
      : 'unknown';
  }
  
  module.exports = extractRemoteAddress;