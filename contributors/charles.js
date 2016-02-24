'use strict';

const KoaRoute = require('koa-route');
const Bluebird = require('bluebird');
const Config = require('config.json')('./config/settings.json', process.env.NODE_ENV);
let app = require('../server');

//require the Google APIs module and promisify it
const Google = require('googleapis');
const Customsearch = Google.customsearch('v1');
let googleKey = Config.google.key;
Bluebird.promisifyAll(Customsearch.cse);

//require the Twilio module and promisify it
var accountSid = Config.twilio.sid;
var authToken = Config.twilio.token;
var Twilio = require('twilio')(accountSid, authToken);
Bluebird.promisifyAll(Twilio.messages);

app.use(KoaRoute.get('/coolPics', function *() {
  // Either use a passed "topic" or just send them cute dogs if they don't want to decide
  let topic = (this.request.query.topic) ? this.request.query.topic : 'cute dogs';
  let phone_number = this.request.query.phone_number;

  // Validate the query - we at least need a phone number
  this.checkQuery('phone_number').notEmpty().len(12, 12, "must be in +X XXX XXX XXXX format").match(/^\+1[0-9]{10}/);
  if (this.errors) {
		this.body = this.errors[0];
		return;
	}

  // Google search params
  let searchParams = {
    fileType: 'jpg',
    imgSize: 'medium',
    safe: 'high',
    q: topic,
    searchType: 'image',
    cx: '013033848846758345769:tenrfa2t3dw',
    auth: googleKey
  };

  // Search for images of the topic, pic a random one on the firs page, and pass that to twilio
  yield Customsearch.cse.listAsync(searchParams)
    .bind(this)
    .then(function(res) {
      this.log.info('Search Result', res);
      let selector = Math.round(Math.random()  * res.items.length);
      let topicalImage = res.items[selector].link;
      let twilioParams = {
      	to: phone_number,
      	from: '+18043810322',
        body: `It is your lucky day! Someone sent you a message with the ${topic} API!`,
        mediaUrl: topicalImage
      };
      return Twilio.messages.createAsync(twilioParams);
    })
    .then(function(message) {
      // Send back the Twilio message deets
      this.log.info('Twilio Message', message);
      this.body = message;
    })
    .catch(function(error) {
      // Catch any errors that may have occurred in the promise chain
      this.log.error(error);
      this.body = error;
    });
}));
