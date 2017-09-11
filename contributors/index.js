'use strict';

let ns = {};
require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file.indexOf('.js') > -1 && file !== 'index.js') {
    ns[file.replace('.js','')] = require('./' + file);
  }
});

module.exports = ns;