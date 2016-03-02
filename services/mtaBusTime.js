/*************************************************************************
 * mtaBusTime.js
 *
 * @description
 * Client for MTA BusTime API (OneBusAway and SIRI) specific to calculations in this app
 * 
 * @author
 * Jeff Csicsek
 *
 *************************************************************************/

var request = require('request-promise');
var config = require('config.json')('./config/settings.json', process.env.NODE_ENV);

module.exports = {

  /**
   * Gets bus stops within a given radius of a geographical coordinate from the OneBusAway API
   * @param {Number} lat - latitude of coordinate
   * @param {Number} lon - longitude of coordinate
   * @param {Number} radius - meters away from address
   * @return {Promise} array of bus stops
   */
  getNearbyStops: function(lat, lon, radius) {

    //call the OneBusAwayAPI
    return request({
      url: "http://bustime.mta.info/api/where/stops-for-location.json",
      qs: {
        lat: lat,
        lon: lon,
        radius: radius,
        key: config.mtaBusTime.key
      }
    }).then(function (body) {

      body = JSON.parse(body);

      //handle unexpected data format
      if (!body.data) {
        console.error("Invalid results from BusTime OneBusAway API", body);
        throw "Invalid results from BusTime OneBusAway API";
      }

      //success case
      console.log("Successfully queried nearby bus stops for lat ", lat, " lon ", lon);
      return body.data.stops;

    });
  },

  /**
   * Get realtime data on busses approaching a bus stop with the given code from the SIRI API
   * @param {Number} stopCode - MTA's unique identifier for bus stops
   * @return {Promise} array of busses
   */
  getRealtimeBusData: function(stopCode) {

    //call the SIRI API
    return request({
      url: "http://bustime.mta.info/api/siri/stop-monitoring.json",
      qs: {
        MonitoringRef: stopCode,
        key: config.mtaBusTime.key
      }
    }).then(function (body) {

      body = JSON.parse(body);

      //handle malformed response format
      if (!body.Siri || !body.Siri.ServiceDelivery || !body.Siri.ServiceDelivery.StopMonitoringDelivery || !body.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit) {
        console.error("Invalid results from BusTime SIRI API", body);
        throw "Invalid results from BusTime SIRI API";
      }

      //success case
      console.log("Successfully retreived realtime bus location info for stop ", stopCode);
      return body.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;

    });
  }
}
