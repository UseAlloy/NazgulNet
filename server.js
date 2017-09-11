/*
 *  This is a project containing a bunch of cool API endpoints...hopefully!
 *  Contribute whatever you want. Don't mess with other people's endpoints though.
 */

'use strict';

require('dotenv').config();

const Koa = require('koa');
const KoaBunyanLogger = require('koa-bunyan-logger');
const KoaRoute = require('koa-router')();

const app = new Koa();

require('koa-validate')(app);
app.use(require('koa-body')());

app.use(KoaBunyanLogger());
app.use(KoaBunyanLogger.requestIdContext());
app.use(KoaBunyanLogger.requestLogger());

// Trust headers from reverse proxy
app.proxy = true;

// Disable default error handling in favor of Bunyan plugin
app.on('error', function () {
});

// Heathcheck returns memory stats
KoaRoute.get('/healthcheck', function (ctx) {
  ctx.body = process.memoryUsage();
});

app.use(KoaRoute.routes());
app.use(KoaRoute.allowedMethods());

/**
 * load routes from contributors
 */
let contributors = require('./contributors');

for (let contributor in contributors) {
  if (typeof contributors[contributor] !== 'undefined') {
    let obj = contributors[contributor];
    app.use(obj.routes());
    app.use(obj.allowedMethods());
  }
}

// Allow config host to override auto interface detection
const host = process.env.HOST || require('lodash').filter(require('os').networkInterfaces().eth0, (nic) => (nic.family === 'IPv4' && nic.internal === false))[0].address;
app.listen(process.env.PORT, host);
console.log({host, port: process.env.PORT}, 'Server ready - let\'s get this party started!');

module.exports = app;


