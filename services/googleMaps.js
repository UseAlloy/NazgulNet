/*************************************************************************
 * googleMaps.js
 *
 * @description
 * Client for Google Maps API specific to calculations in this app
 * 
 * @author
 * Jeff Csicsek
 *
 *************************************************************************/


var request = require('request-promise');
var config = require('config.json')('./config/settings.json', process.env.NODE_ENV);

/**
 * Gets walking distance and time between an address and a geographical coordinate
 * @param {String} originAddress - origin address
 * @param {Number} destinationLat - latitude of destination
 * @param {Number} destinationLon - longitude of destination
 * @return {Promise} Distance in time and meters, both numerical and human-readable
 */
module.exports = {
  calculateWalkingDistance: function(originAddress, destinationLat, destinationLon) {

    //call the Google Maps API
    return request({
      url: "https://maps.googleapis.com/maps/api/distancematrix/json",
      qs: {
        origins: originAddress,
        destinations: destinationLat + "," + destinationLon,
        mode: "walking",
        key: config.google.key,
        units: "imperial"
      }
    }).then(function (body) {

      body = JSON.parse(body);

      //handle unexpected results format from API server
      if (!body.rows || !body.rows[0].elements) {
        console.error("Unexpected results format from Google API", body);
        throw "Unexpected results format from Google API";
      }

      //we always want the first result element, since we only use one origin-destination pair
      var result = body.rows[0].elements[0];

      //invalid address query
      if (result.status != 'OK') {
        console.error("Invalid address passed to Google API");
        throw "Invalid address passed to Google API";
      }

      //handle success case
      console.log("Successfully retreived walking distance and duration from Google API");
      return result;
    });
  },


  /**
   * Gets geographical coordinates from an address
   * @param {String} address - address to geocode
   * @return {Promise} latitude and longitude of address
   */
  geocodeAddress: function(address) {

    //call the Google Maps API
    return request({
      url: "https://maps.googleapis.com/maps/api/geocode/json",
      qs: {
        address: address,
        key: config.google.key
      }
    }).then(function (body) {

      body = JSON.parse(body);

      //invalid address query
      if (body.status != 'OK') {
        console.error("Invalid address passed to Google API");
        throw "Invalid address passed to Google API";
      }

      //handle unexpected results format from API server
      if (!body.results || !body.results[0].geometry || !body.results[0].geometry.location) {
        console.error("Unexpected results format from Google API", body);
        throw "Unexpected results format from Google API";
      }

      //success case -- send back latitude/longitude pair
      console.log("Successfully geocoded address from Google API");
      return body.results[0].geometry.location;
    });
  }
}
