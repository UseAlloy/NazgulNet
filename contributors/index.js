'use strict';
require('fs').readdirSync(__dirname).forEach(function(file) {
	if (file.indexOf('.js') > -1) require('./' + file);
});
