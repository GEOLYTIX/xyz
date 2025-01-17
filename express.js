require('dotenv').config();
require('./mod/utils/processEnv.js');

const express = require('express');

const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false,
});

app.use(limiter);

app.use(
  '/xyz',
  express.static('docs', {
    extensions: ['html'],
  }),
);

app.use(`${xyzEnv.DIR}/public`, express.static('public'));

app.use(xyzEnv.DIR, express.static('public'));

app.use(`${xyzEnv.DIR}/tests`, express.static('tests'));

app.use(xyzEnv.DIR, express.static('tests'));

app.use(cookieParser());

const api = require('./api/api');

app.get(`${xyzEnv.DIR}/api/provider/:provider?`, api);

app.post(
  `${xyzEnv.DIR}/api/provider/:provider?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${xyzEnv.DIR || ''}/api/sign/:signer?`, api);

app.get(`${xyzEnv.DIR}/api/query/:template?`, api);

app.post(
  `${xyzEnv.DIR}/api/query/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${xyzEnv.DIR}/api/fetch/:template?`, api);

app.post(
  `${xyzEnv.DIR}/api/fetch/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${xyzEnv.DIR}/api/workspace/:key?`, api);

app.get(`${xyzEnv.DIR}/api/user/:method?/:key?`, api);

app.post(
  `${xyzEnv.DIR}/api/user/:method?`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  api,
);

app.get(`${xyzEnv.DIR}/saml/metadata`, api);

app.get(`${xyzEnv.DIR}/saml/logout`, api);

app.get(`${xyzEnv.DIR}/saml/login`, api);

app.post(`${xyzEnv.DIR}/saml/acs`, express.urlencoded({ extended: true }), api);

app.get(`${xyzEnv.DIR}/view/:template?`, api);

app.get(`${xyzEnv.DIR}/:locale?`, api);

app.get(`/`, api);

app.listen(xyzEnv.PORT);
