/**
 * @description
 * Takes an geocoodinate from query and returns the current weather forecast of that place
 * along with nearby recommended food places 
 * @author 
 * Jeevan  
 *
 */

'use strict'
var Zomato = require('../services/zomato');
var KoaRoute = require('koa-router')();
var DarkSkyWeather = require('../services/darkSkyWeather');

KoaRoute.get('/foodandweather', async (ctx) => {

    // Queries and assigns lat and lng values
    var lat = ctx.request.query.lat;
    var lng = ctx.request.query.lng;
    
    try {
    // Sets weather values 
      var weather = new DarkSkyWeather;
      weather.setLatitude(lat);
      weather.setLongitude(lng);
      var dataWeather = await weather.getWeather();
      var resWeather = dataWeather.hourly.summary;
      
      // Sets restaurant values 
      var food = new Zomato;
      food.setLatitude(lat);
      food.setLongitude(lng);
      var resFood = await food.getNearbyRestaurants();
    
      while (resFood) {

      }
      ctx.body = {
        resWeather,
        resFood
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



