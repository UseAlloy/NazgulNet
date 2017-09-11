/**
 * @description
 * Client for Dark Sky API
 *
 * @requires API_KEY from Dark Sky
 * @see https://darksky.net/dev/
 */

const request = require('request-promise-native');

class DarkSkyWeather {

  constructor() {
    if (typeof process.env.WEATHER_API_KEY === 'undefined') {
      throw new Error('Weather API KEY has not been set', 500);
    }
    this.api_key = process.env.WEATHER_API_KEY;

    this.geo_validator = new RegExp(/^-?\d*(\.\d+)?$/);

    this.url = "https://api.darksky.net/forecast/" + this.api_key;

  }

  /**
   * @desc Get Weather Data
   *
   * @requires lat,lng to be set
   * @returns {Promise}
   */
  async getWeather() {
    if (typeof this.latitude === 'undefined' || typeof this.longitude === 'undefined') {
      throw new Error('GeoCoordinates are not defined. Please define these Coordinates (`latitude` and `longitude`)');
    }

    let api_url = this.url + '/' + this.latitude + ',' + this.longitude;

    return new Promise(function (resolve, reject) {
      request({
        url: api_url
      }, function (error, response, body) {
        if (error) {
          return reject(error);
        }

        resolve(JSON.parse(body));

      });
    });
  }

  /**
   * @description Set Latitude
   * Set and validate latitude coordinates
   *
   * @param {float} lat
   * @returns {DarkSkyWeather}
   */
  setLatitude(lat) {
    if (!this.geo_validator.exec(lat)) {
      throw new Error('Could not validate GeoCoordinates Latitude!');
    }

    this.latitude = lat;
    return this;

  }

  /**
   * @description Set Longitude
   * Set and validate longitude coordinates
   *
   * @param {float} lng
   * @returns {DarkSkyWeather}
   */
  setLongitude(lng) {
    if (!this.geo_validator.exec(lng)) {
      throw new Error('Could not validate GeoCoordinates Longitude!');
    }

    this.longitude = lng;
    return this;
  }
}


module.exports = DarkSkyWeather;