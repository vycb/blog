/**
 * Module dependencies.
 */

var express = require('express');
var logger = require('morgan');
var vhost = require('vhost');

/*
edit /etc/hosts:

127.0.0.1       w1.example.com
127.0.0.1       w2.example.com
127.0.0.1       example.com
*/

// Main server app

var main = express();

if (!module.parent) main.use(logger('dev'));

main.get('/', function(req, res){
  res.send('Hello from main app!');
});

main.get('/:sub', function(req, res){
  res.send('requested ' + req.params.sub);
});

// Redirect app

var redirect = express();

redirect.use(function(req, res){
  if (!module.parent) console.log(req.vhost);
  res.redirect('http://wheezy64.dev:3000/' + req.vhost[0]);
});

var userapp = express();

userapp.get('/', function(req, res){
	res.send('Hello from userapp app! ' + req.vhost[0]);
});

// Vhost app
var app = module.exports = express();

app.use(vhost('*.wheezy64.dev', userapp)); // Serves all subdomains via Redirect app

app.use(vhost('wheezy64.dev', main)); // Serves top level domain via Main server app

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
