/* Initialization */
let request = require('request-promise');
let config = require('config.json')('./config/settings.json', process.env.NODE_ENV);
let isEqual = require('lodash/isEqual');

/**
* @desc Get Tweets up to a maximum of 200 counts (defaulted to 10) from a twitter user by username.
* @requires userName to be set correctly. Rest are defaulted
*/
function twitter() {

  /* Returns an Array of string of tweets from specified username */
  this.getTweetsFromUserByName = async function(userName, count = 10, includeRetweets = false) {

    /* Check for valid username */
    if (!userName && !isEqual(typeof(userName, 'string'))) {
      throw new Error('User name must be specified of string type!');
    }
    return request({
      method: 'GET',
      url: "https://api.twitter.com/1.1/statuses/user_timeline.json",
      qs: {
        count: count,
        screen_name: userName,
        include_rts: includeRetweets, // No retweets! Only pure original content
        trim_user: true, // Ignore User object - we are only interested in juicy tweets!
        exclude_replies: true, // Replies of User to others omitted 
      },
      oauth: {
        consumer_key: config.twitter.key,
        consumer_secret: config.twitter.secret,
      },
      json: true /* Sets return type to be of Json - No need for parsing */
    }).then(function (response) {
      /* Return an array of string */
      return response.map(tweet => tweet.text);
    });
  }
}

let Twitter = new twitter;
module.exports = Twitter;
