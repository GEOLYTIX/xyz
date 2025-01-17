require('dotenv').config();

const express = require('express');

const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');

const app = express();

app.disable('x-powered-by');

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

app.use(`${process.env.DIR || ''}/public`, express.static('public'));

app.use(process.env.DIR || '', express.static('public'));

app.use(`${process.env.DIR || ''}/tests`, express.static('tests'));

app.use(process.env.DIR || '', express.static('tests'));

app.use(cookieParser());

const api = require('./api/api');

app.get(`${process.env.DIR || ''}/api/provider/:provider?`, api);

app.post(
  `${process.env.DIR || ''}/api/provider/:provider?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/sign/:provider?`, api);

app.post(
  `${process.env.DIR || ''}/api/sign/:provider?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/query/:template?`, api);

app.post(
  `${process.env.DIR || ''}/api/query/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/fetch/:template?`, api);

app.post(
  `${process.env.DIR || ''}/api/fetch/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/workspace/:key?`, api);

app.get(`${process.env.DIR || ''}/api/user/:method?/:key?`, api);

app.post(
  `${process.env.DIR || ''}/api/user/:method?`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  api,
);

app.get(`${process.env.DIR || ''}/saml/metadata`, api);

app.get(`${process.env.DIR || ''}/saml/logout`, api);

app.get(`${process.env.DIR || ''}/saml/login`, api);

app.post(
  `${process.env.DIR || ''}/saml/acs`,
  express.urlencoded({ extended: true }),
  api,
);

app.get(`${process.env.DIR || ''}/view/:template?`, api);

app.get(`${process.env.DIR || ''}/:locale?`, api);

process.env.DIR && app.get(`/`, api);

app.listen(process.env.PORT || 3000);
