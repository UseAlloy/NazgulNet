'use strict';

const Config = require('config.json')('./config/settings.json', process.env.NODE_ENV);
let nyTimesKey = Config.nyTimes.key
let mailgunFrom = Config.mailgun.from;
let mailgunDomain = Config.mailgun.domain;
let mailgunKey = Config.mailgun.key;

const Bluebird = require('bluebird');
const KoaRoute = require('koa-route');
const Mailgun = require('mailgun-js')({apiKey: mailgunKey, domain: mailgunDomain});
const Request = require('request');

let app = require('../server');

Bluebird.promisifyAll(Mailgun);
Bluebird.promisifyAll(Request);

app.use(KoaRoute.get('/searchArticle', function *() {
    // Grab request parameters
    let term = this.request.query.term;
    let email = this.request.query.email;
    let name = this.request.query.name;
    
    // Validate request parameters
    this.checkQuery('term').notEmpty();
    this.checkQuery('email').isEmail();
    this.checkQuery('name').notEmpty()
    if (this.errors) {
        this.body = this.errors;
        return;
    }
    
    // Create parameters and options to query the NY Times Search Article API
    let parameters = {
        "q": term,
        "api-key": nyTimesKey
    };
    
    let options = {
        method: 'GET',
        url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
        qs: parameters
    }
    
    yield Request.getAsync(options)
        .bind(this)
        .then(function(response) {
            let json = JSON.parse(response.body)
            
            // Grab the url and headline from the first object (article) of the response
            let message = json.response.docs[0].web_url;
            let subject = json.response.docs[0].headline;
            
            // Build Mailgun options to send email
            var options = {
                from: mailgunFrom,
                to: email,
                subject: subject,
                text: message
            };
            
            return Mailgun.messages().send(options);
        })
        .then(function(response) {
            this.body = response.message;
        })
        .catch(function(error) {
            this.body = error;
        });
        
}));
