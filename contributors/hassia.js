'use strict';

const KoaRoute = require('koa-route');
const Bluebird = require('bluebird');
const Config = require('config.json')('./config/settings.json', process.env.NODE_ENV);

let app = require('../server');

app.get('/', routes.index);

app.get('/:short', shortenurl.getLong);

app.post('/create', shortenurl.createShort);
