let nock = require('nock');

process.stdout.write('Setup Mock service');

nock('https://api.darksky.net')
    .get(/^\/forecast/)
    .replyWithFile(200, __dirname + '/replies/WeatherForecasts.json');

process.stdout.write('...done!');


module.exports = nock;