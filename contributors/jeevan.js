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

KoaRoute.get('/currentweather', async (ctx) => {

    var weather = new DarkSkyWeather;
    var lat = ctx.request.query.lat;
    var lng = ctx.request.query.lng;
    weather.setLatitude(lat);
    weather.setLongitude(lng);
    console.log(lat +' ' + lng);

    var food = new Zomato;
    var resFood, resWeather;
    food.setLatitude(lat);
    food.setLongitude(lng);

   
    
    food.getNearbyRestaurants()
    .then((res) => {
      resFood = res;
      console.log(resFood);
      return weather.getWeather();
    })
    .then((res) => {
      resWeather = res;
      
      console.log(resFood);
      console.log(resWeather);
    })
    .catch(err => console.error(err));

    ctx.body = {
      resFood,
      resWeather
    }
});

module.exports = KoaRoute;



