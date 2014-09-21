/**
 * Module dependencies.
 */

var express = require('express'),
		logger = require('morgan'),
		session = require('express-session');

// pass the express to the connect redis module
// allowing it to inherit from session.Store
var RedisStore = require('connect-redis')(session),
//		redis = require("redis").createClient(11548, 'pub-redis-11548.us-east-1-3.2.ec2.garantiadata.com'),
		app = express();

app.use(logger('dev'));

// Populates req.session
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'keyboard cat',
  store: new RedisStore({port: 11548, host: 'pub-redis-11548.us-east-1-3.2.ec2.garantiadata.com'/*, client: redis*/})
}));

app.get('/', function(req, res){
  var body = '';
  if (req.session.views) {
    ++req.session.views;
  } else {
    req.session.views = 1;
    body += '<p>First time visiting? view this page in several browsers :)</p>';
  }
  res.send(body + '<p>viewed <strong>' + req.session.views + '</strong> times.</p>');
});

app.listen(3000);
console.log('Express app started on port 3000');
