let app = require('../../server');
let request = require('supertest')(app.listen());

let assert = require('assert');

describe('Weather', () => {
  it('"GET /weather?lat=42.3601&lng=-71.0589" should return json object with summary', function () {
    return request
        .get('/weather')
        .query({lat: 42.3601, lng: -71.0589})
        .expect(200)
        .then(response => {
          assert(response.body.summary, "Rain starting this evening, continuing until tomorrow morning.");
        });
  });
});
