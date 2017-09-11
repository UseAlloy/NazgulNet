/**
 *
 * @author Tommy Gonzalez
 *
 * @desc
 * Sentiment Weather
 * - Gets the current weather
 * - Judges the summary of the projected forecast with sentiment polarity.
 */

'use strict';

let request = require('request-promise-native');
let KoaRoute = require('koa-router')();
let emotional = require('emotional');

let DarkSkyWeather = require('../services/darkSkyWeather');

/**
 * @desc
 * Get current weather by lat,lng
 *
 * @param {float} lat
 * @param {float} lng
 *
 */
KoaRoute.get('/weather', async (ctx) => {
  let lat = ctx.checkQuery('lat').notEmpty('This route requires two parameters, (lat,lng)').toFloat(),
      lng = ctx.checkQuery('lng').notEmpty().toFloat();

  if (typeof ctx.errors !== 'undefined') {
    ctx.status = 400;
    ctx.body = {
      errors: ctx.errors
    };
    return;
  }


  try {
    let weather = new DarkSkyWeather;
    weather.setLatitude(lat.value).setLongitude(lng.value);
    let weatherData = await weather.getWeather();

    let summary = weatherData.hourly.summary;

    let sentiment = await new Promise((resolve) => {
      emotional.load(function () {
        resolve(emotional.get(summary));
      });
    });
    ctx.body = {
      summary,
      currently: weatherData.currently,
      timezone: weatherData.timezone,
      sentiment: {
        is_positive: emotional.positive(summary, 0.5),
        polarity: sentiment.polarity,
        subjectivity: sentiment.subjectivity
      }
    };
  }
  catch (error) {
    ctx.statusCode = 400;
    ctx.body = {
      error
    }
  }
});

module.exports = KoaRoute;