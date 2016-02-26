//this function get a long URL and shotens it
exports.createShort = function (req, res) {
 
var urlToShorten = req.body.urlToShorten;

// check if the user enters a URL to be shorten 
 if (!urlToShorten) {
 console.log('Request did not contain a url to shorten, please provide  urlToShorten');
 } 

//if the user enters a URL to shorten, start shorthening 
 else {
 
  console.log("Request to shorten " + urlToShorten);
 
//use the addhttp function to add 'http' to the URL in case it does not already have it
  urlToShorten = addhttp(urlToShorten);
 
// create the baseURL by getting the hostname and adding 'http'
  var baseUrl = 'http://' + req.app.get('hostname') + '/';
 
// use the shortCode function to get the shortCode (URI) for the URL
  var shortCode = ShortCode(urlToShorten);
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  res.render('short', { shortUrl: baseUrl + shortCode });
 }
 };
 
 
 
//this is the shortCode function that get the shortCode of the long URL
 function ShortCode(longUrl) {
    console.log("Creating short code for url " + longUrl);

// create a hashmap to store URLs 
	var map = {};
	
// check if the shortcode does not already exist for the long URL. if not, create the code and put it in the hash
    if (!(longURL in map)) {
        console.log(longUrl + " has not already been shortened, so shortening it now.");
		
// use the randomString to generate a random string of length 5 that will be used as the short code (or URI)
        shortUrlCode = randomString(5);
        console.log("Shortened " + longUrl + " to a shortcode of " + shortUrlCode);

// store the shortcode in a hashmap with the key being the long URL and the value being the shortcode 
    
	map [longURL] = shortUrlCode;
	
    }

    return shortUrlCode;
};



// this function generates a random string of a certain length 
function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ';
    var result = '';

    console.log("Generating random alphanumeric string of length " + length);
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
};

// this function add the 'http' word to a given URL that does not already have it
function addhttp(url) {
    console.log("Adding http:// prefix to " + url + " if it doesnt already have it.");

    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "http://" + url;
    }
    return url;
};


//this function get the Short URL and retrieve the Long URL before redirecting to it (the long URL)

   exports.getLong = function (req, res) {
 
   var shortCode = req.path.substring(1);
 
   console.log("Fetching longURL indexed of " + shortCode);
   
   var theLongUrl = map.getKeyByValue(shortCode);
 
   console.log('Short code ' + shortCode + " refers to " + theLongUrl);
 
   console.log("redirecting to " + theLongUrl);
   res.writeHead(302, {'Location': theLongUrl});
   res.end();
 };
 
// with this function I am trying to get the long URL given the short URL. Since the long URL is the key in the map, it is a bit more complicated 
 Object.prototype.getKeyByValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
};