/**
 * Created by vach on 10/2/2014.
 */

var logger = require('koa-logger');
//var busboy = require('koa-bodyparser');
var busboy = require('co-busboy');
var co = require('co');
var koa = require('koa');
var app = koa();
var path = require('path');
// log requests
app.use(logger());
// custom 404
app.use(function *(next){
	yield next;
	if(this.body || !this.idempotent) return;
	this.body = '404.html';
});

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
	if('POST' != this.method) return yield next;

// multipart upload
	var parts = busboy(this),
			part;

	this.type = 'image/jpeg';
	this.response.type = 'image/jpeg';

	while(part = yield parts){
		if (part.length) {
			// arrays are busboy fields
			console.log('key: ' + part[0])
			console.log('value: ' + part[1])
		}
		else{

//			this.body = part.read();
//			this.body = part.;
//			this.response.body = part;
//			part.pipe(this.response.body);
			part.pipe(this.body);
		}

//		this.res.end();
		console.log('uploading %s ', part.filename);

		if(this.body && !part){
			this.res.end();
		}
	}

//	setImmediate(function () {
//		if(this.body && !part){
//			this.res.end();
//		}
//	});

//	co(function*(){
//		if(this.body && !part){
//			yield this.res.end();
//		}
//	})()
	if(this.body && !part){
		this.res.end();
	}
});


// listen
app.listen(3000);
console.log('listening on port 3000');