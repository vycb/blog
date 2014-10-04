/**
 * Created by vach on 10/2/2014.
 */
var logger = require('koa-logger');
//var serve = require('koa-static');
var parse = require('co-busboy');
var koa = require('koa');
var fs = require('fs');
var app = koa();
var os = require('os');
var path = require('path');
// log requests
app.use(logger());
// custom 404
app.use(function *(next){
	yield next;
	if (this.body || !this.idempotent) return;
//	this.redirect('/404.html');
});
// serve files from ./public
//app.use(serve(__dirname + '/public'));
app.use(function *index(next){
	yield next;
	if ('/' != this.url && 'GET' != this.method) return;

	this.body = '<form action="/upload" enctype="multipart/form-data" method="post">'+
		'<input type="text" name="title"><br>'+
		'<input type="file" name="image" multiple="multiple"><br>'+
		'<input type="submit" value="Upload">'+
		'</form>';
});

// handle uploads
app.use(function *(next){
// ignore non-POSTs
	if ('POST' != this.method) return yield next;
// multipart upload
	var parts = parse(this);
	var part;
	while (part = yield parts) {
		if (part.length) {
			// arrays are busboy fields
			console.log('key: ' + part[0])
			console.log('value: ' + part[1])
		}
		else{
			var stream = fs.createWriteStream(path.join(__dirname, part.filename+""));
			part.pipe(stream);
			console.log('uploading %s -> %s', part.filename, stream.path);
		}
	}
	this.redirect('/');
});
// listen
app.listen(3000);
console.log('listening on port 3000');