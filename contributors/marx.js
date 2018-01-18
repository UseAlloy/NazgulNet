/**
 *
 * @author Marx Low
 *
 * @description
 * Twitter analysis
 * - Gets most recent tweets by twitter user
 * - Returns number of occurence of specified key word
 */

let Twitter = require('../services/twitter');
let KoaRoute = require('koa-router')();

const DEFAULT_KEY = 'fake news';
const DEFAULT_USER = 'realDonaldTrump';
const DEFAULT_COUNT = 200;

/**
*
* @description defaulted to fetch number of 'fake news" occurence in the most recent 200 donald trump tweets
*
*/
KoaRoute.get('/tweetsnumber', async (ctx) => {

  const key = ctx.query['key'] ? ctx.checkQuery['key'].toLowerCase() : DEFAULT_KEY; /* Convert key to lower case */
  const userName = ctx.query['username'] ? ctx.query['username'] : DEFAULT_USER;
  const count = ctx.query['count'] ? ctx.query['count'] : DEFAULT_COUNT;

  try {
    const result = await Twitter.getTweetsFromUserByName(userName, count);
    let keyCount = 0;
    for (let i = 0; i < result.length; i ++) {
      const currentTweet = result[i].toLowerCase(); // convert tweets to lower case
      if (currentTweet.includes(key)) {
        keyCount += 1; // appends count if there is a match
      }
      ctx.body = {
        key,
        user_name: userName,
        key_count: keyCount,
        tweets_analyzed: count,
        key_occurence_probability: (keyCount / count).toFixed(2),
      };
    }
  } catch (e) {
    /* Handle error */
    console.log(`Error while fetching ${count} tweets with username: ${userName}. Error is:\n ${error.message}`);
    ctx.statusCode = 400;
    ctx.body = {
      error
    }
  }
 });

 module.exports = KoaRoute;
