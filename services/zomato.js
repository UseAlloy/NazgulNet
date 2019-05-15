const request = require('request-promise');

class Zomato {

    constructor() {
        if (typeof process.env.WEATHER_API_KEY === 'undefined') {
            throw new Error('Weather API KEY has not been set', 500);
          }
        this.api_key = process.env.ZOMATO_API_KEY;

        this.geo_validator = new RegExp(/^-?\d*(\.\d+)?$/);
        this.geo_validator = new RegExp(/^-?\d*(\.\d+)?$/);


        this.url = "https://developers.zomato.com/api/v2.1/geocode?";
    }

    async getNearbyRestaurants() {
        if (typeof this.latitude === 'undefined' || typeof this.longitude === 'undefined') {
            throw new Error('GeoCoordinates are not defined. Please define these Coordinates (`latitude` and `longitude`)');
          }

        var api_url = this.url + "lat=" + this.latitude + "&lon=" + this.longitude + "&apikey=" + this.api_key;

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

    setLatitude(lat) {
        if (!this.geo_validator.exec(lat)) {
          throw new Error('Could not validate GeoCoordinates Latitude!');
        }
    
        this.latitude = lat;
        return this;
    
      }
    

    setLongitude(lng) {
        if (!this.geo_validator.exec(lng)) {
          throw new Error('Could not validate GeoCoordinates Longitude!');
        }
    
        this.longitude = lng;
        return this;
      }
}

module.exports = Zomato;