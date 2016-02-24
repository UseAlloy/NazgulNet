/*
 *  This is a project containing a bunch of cool API endpoints...hopefully!
 *  Contribute whatever you want. Don't mess with other people's endpoints though.
 */

'use strict';

const Koa = require('koa');
const KoaBunyanLogger = require('koa-bunyan-logger');
const KoaRoute = require('koa-route');
const Bluebird = require('bluebird');
const app = Koa();
const Config = require('config.json')('./config/settings.json', process.env.NODE_ENV);

app.use(require('koa-body')());
app.use(require('koa-validate')());
app.use(KoaBunyanLogger());
app.use(KoaBunyanLogger.requestIdContext());
app.use(KoaBunyanLogger.requestLogger());

// Trust headers from reverse proxy
app.proxy = true;

// Disable default error handling in favor of Bunyan plugin
app.on('error', function() {});

// Heathcheck returns memory stats
app.use(KoaRoute.get('/healthcheck', function *() { this.body = process.memoryUsage(); }));

// Allow config host to override auto interface detection
const host = Config.app.host || require('lodash').filter(require('os').networkInterfaces().eth0, (nic) => (nic.family === 'IPv4' && nic.internal === false))[0].address;
app.listen(Config.app.port, host);
console.log({ host, port: Config.app.port }, 'Server ready - let\'s get this party started!');

module.exports = app;

require('./contributors');
