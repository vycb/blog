/**
 * Module dependencies.
 */

    var express = require('express');
var fs = require('fs');

module.exports = function(parent, options){
  var verbose = options.verbose;
  fs.readdirSync(__dirname + '/../controllers').forEach(function(name){
    verbose && console.log('\n   %s:', name);
    var obj = require('./../controllers/' + name);
    var name = obj.name || name;
    var prefix = obj.prefix || '';
    var app = express();
    var handler;
    var method;
    var path;
debugger;
    // allow specifying the view engine
    if (obj.engine) app.set('view engine', obj.engine);
    app.set('views', __dirname + '/../controllers/' + name + '/views');

    // generate routes based
    // on the exported methods
    for (var thekey in obj) {
      // "reserved" exports
      if (~['name', 'prefix', 'engine', 'before'].indexOf(thekey)){
          continue;
      }
      // route exports
      switch (thekey) {
        case 'show':
          method = 'get';
          path = '/' + name + '/:' + name + '_id';
          break;
        case 'list':
          method = 'get';
          path = '/' + name + 's';
          break;
        case 'edit':
          method = 'get';
          path = '/' + name + '/:' + name + '_id/edit';
          break;
        case 'update':
          method = 'put';
          path = '/' + name + '/:' + name + '_id';
          break;
        case 'create':
          method = 'post';
          path = '/' + name;
          break;
        case 'index':
          method = 'get';
          path = '/';
          break;
        default:
          /* istanbul ignore next */
          throw new Error('unrecognized route: ' + name + '.' + thekey);
      }

      // setup
      handler = obj[thekey];
      path = prefix + path;

      // before middleware support
      if (obj.before) {
        app[method](path, obj.before, handler);
        verbose && console.log('     %s %s -> before -> %s', method.toUpperCase(), path, thekey);
      } else {
        app[method](path, obj[thekey]);
        verbose && console.log('     %s %s -> %s', method.toUpperCase(), path, thekey);
      }
    }

    // mount the app
    parent.use(app);
  });
};
