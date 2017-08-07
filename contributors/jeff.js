/*************************************************************************
 * jeff.js
 *
 * @description
 * Takes an address and returns a list of nearby bus stops and realtime data about
 * nearby busses servicing those stops
 * 
 * @author
 * Jeff Csicsek
 *
 *************************************************************************/

var googleMaps = require('../services/googleMaps');
var mtaBusTime = require('../services/mtaBusTime');
var KoaRoute = require('koa-router')();
var _ = require('lodash');

var DEFAULT_RADIUS = 300;

KoaRoute.get('/bustime', function* () {

  var ctx = this;

  var address = this.request.query.address;
  //radius, in meters, is optional
  var radius = this.request.query.radius ? this.request.query.radius : DEFAULT_RADIUS;

  //address is required
  if (!address) {
    this.response.status = 400;
    this.response.body = {status: "error", message: "Request must include address query parameter"};
    return;
  }

  //first step is to geocode the origin address so we can query nearby bus stops
  yield googleMaps.geocodeAddress(address)
    .bind(this)
    .then(function (geocodeResults) {

      //query nearby bus stops within the provided or default radius using the MTA's OneBusAway API
      return mtaBusTime.getNearbyStops(geocodeResults.lat, geocodeResults.lng, radius);
    })
    .then(function (nearbyStops) {
      return nearbyStops;
    })

    //iterate over each bus stop
    .map(function (busStop) {

      //get realtime bus location data for each bus stop
      return mtaBusTime.getRealtimeBusData(busStop.code)
      .then(function (realtimeBusData) {

        //get walking distance and time for each bus stop
        return googleMaps.calculateWalkingDistance(address, busStop.lat, busStop.lon)
        .then(function (busStopWalkingData) {

          //massage data about each bus
          var busesData = _.map(realtimeBusData, function (bus) {
            var data =  {
              line: bus.MonitoredVehicleJourney.PublishedLineName,
              destination: bus.MonitoredVehicleJourney.DestinationName,
              arrivalAtStop: bus.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime
            }

            //if we have arrival info about a given bus, time to do some calculations
            if (bus.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime) {

              //use the timestamp from the api to find how long until bus arrives
              var secondsUntilArrival = Math.floor(Math.abs(new Date(bus.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime) - new Date()) / 1000);
              var minutesUntilArrival = Math.ceil(secondsUntilArrival / 60);

              //subtract from this the amount of time it takes to walk to the bus stop to find out when we need to leave
              var shouldLeaveIn = secondsUntilArrival - busStopWalkingData.duration.value;
              var shouldLeaveInMinutes = Math.floor(shouldLeaveIn / 60);

              //construct a human-readable summary of this bus
              //example: "There is a WILLIAMSBURG BRIDGE PLZ bound B24 bus due to arrive in 19 minutes. You need to leave in 12 minutes to catch this bus."
              var humanReadable = "There is a " + data.destination + " bound " + data.line + " bus due to arrive in " + minutesUntilArrival + " minutes."
              if (shouldLeaveIn > 0) {
                humanReadable += " You need to leave in " + shouldLeaveInMinutes + " minutes to catch this bus.";
              } else {
                humanReadable += " You would not be able to make it in time to catch this bus!";
              }

              //bind this calculated data to the return value
              data.humanReadable = humanReadable;
              data.shouldLeaveInMinutes = shouldLeaveInMinutes;
              data.arrivesInMinutes = minutesUntilArrival;
            } else {

              //human-readable results for an untracked bus
              data.humanReadable = "This bus is not currently being tracked.";
            }

            return data;
          });

          //parse all data and put it together into desired response format
          var responseData = {
            stopName: busStop.name,
            stopDistanceAway: busStopWalkingData.distance.text,
            stopWalkingTime: busStopWalkingData.duration.text,
            buses: busesData
          };
          return responseData;
        })

        //re-throw errors up stack from getting walking directions
        .catch(function (error) {
          throw error;
        });
      })

      //re-throw errors up stack from getting realtime bus data
      .catch(function (error) {
        throw error;
      });
    })
    .then(function (responseData) {

      //send back the response!
      this.body = responseData;
    })

    //log and send back any errors
    .catch(function (error) {
      console.error(error);
      this.body = error;
    });
});


module.exports = KoaRoute;