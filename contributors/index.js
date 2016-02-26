'use strict';
require('fs').readdirSync(__dirname).forEach(function(file) {
	if (file.indexOf('.js') > -1) require('./' + file);
});

//Hassia Code: I am trying to create a page where the user can enter a URl to be shorten using a Jade View 
 
 exports.index = function (req, res) {
 console.log('Displaying index page where users can enter a long url')
 
 res.render('index');
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

extends layout
 
block content
 h1= title
 h1.text-center Node.js URL Shortener
 
 div.container
 div.content
 div.well
 form.form-horizontal(name="input", action="/create", method="post")
 div.form-group(align='center')
 p
 input(type="text", name="urlToShorten", class="form-control",   placeholder="Enter a URL")
 p
 input(type="submit", value="Shorten", class="btn btn-primary")