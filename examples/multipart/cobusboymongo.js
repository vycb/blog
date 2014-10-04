/**
 * Created by vach on 10/2/2014.
 */
var logger = require('koa-logger');
//var busboy = require('koa-bodyparser');
var busboy = require('co-busboy');
//var co = require('co');
var koa = require('koa');
var route = require('koa-route');
var app = koa();
//var path = require('path');
var
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	GridStore = require('mongodb').GridStore,
	mongolabcon = 'mongodb://vycb:123@ds039010.mongolab.com:39010/blog',
	localcon = 'mongodb://localhost:27017/blog',
	gcollection, gfiles, db;
// Initialize connection once
MongoClient.connect(mongolabcon,{db: {native_parser: false}}, function(err, database){
	if(err) throw err;

	db = database;
/*

	db.collection("articles", function(error, coll){
		gcollection = coll;
	});
*/

	db.collection("fs.files", function(error, coll){
		gfiles = coll;
	});
});

// log requests
app.use(logger());
// custom 404
//app.use(function *(next){
//	yield next;
//	if(this.body) return;
//	this.body = '404.html';
//});

app.use(route.get('/form', function *index(next){

	this.body = '<form action="/upload" enctype="multipart/form-data" method="post">'+
		'<input type="text" name="title"><br>'+
		'<input type="file" name="image" multiple="multiple"><br>'+
		'<input type="submit" value="Upload">'+
		'</form>';
}));

app.use(route.get('/files', function *files(next){
	var fn;

	function genHtml(){
		var html = '';
		gfiles.find().each(function(err, result){

			if(result){
//			this.body
				html += (result.filename + '<br/>');
				/*html += ('<a href="'+result._id+'" class="'+result._id+'">'
				 +result._id+'</a>'
				 + '<img id="'+result._id+'" src="" />');*/
			}
			else{
				console.log(html);
			}
		});

		return function(){
			return html;
		}
	}

	fn = yield genHtml();
	this.body = fn();
//	this.body = html;
}));

// handle uploads
app.use(route.post('/upload', function *(next){
// ignore non-POSTs

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

		new GridStore(db, new ObjectID(), part.filename, 'w').open(function(err, gs)
			{
				if(!gs){
					return;
				}

				part.pipe(gs);
			});

		}

//		this.res.end();
		console.log('uploading %s ', part.filename);

	}

}));


// listen
app.listen(3000);
console.log('listening on port 3000');