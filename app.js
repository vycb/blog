/**
 * Module dependencies.
 */

var express = require('express'),
	logger = require('morgan'),
	errorHandler = require('errorhandler'),
//	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	favicon = require('serve-favicon'),
	routes = require('./routes'),
    debug = require('debug')('app4')
    ;

var app = express();

app.set('port', process.env.PORT || 3000);
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
//app.use(app.router);
//app.use(serveStatic(__dirname, 'public'));
app.use(express.static(__dirname + '/public'));

app.use(function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    res.render('error', { error: err });
});

app.get('/', routes.index);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

