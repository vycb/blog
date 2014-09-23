/**
 * Created by vach on 9/13/2014.
 */
var
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	Binary = require('mongodb').Binary,
	GridStore = require('mongodb').GridStore,
	Code = require('mongodb').Code,
	BSON = require('mongodb').pure().BSON,
	fs = require("fs"),
	db;
// Initialize connection once
MongoClient.connect("mongodb://vycb:123@ds039010.mongolab.com:39010/blog",{db: {native_parser: false}}, function(err, database){
	if(err) throw err;

	db = database;
});

exports.findAll = function(callback){
	db.collection("articles", function(err, collection){
		collection.find().toArray(callback);
	});
};

exports.findById = function(id, callback){
	db.collection("articles", function(error, collection){
		collection.findOne({_id: new ObjectID(id)}, callback);
	});
};

exports.image = function(id, res, callback){
		// Open a new file
		var gridStore = new GridStore(db, new ObjectID(id), 'r');

		// Open the new file
		gridStore.open(function(err, gs){
// Create a stream to the file
			var stream = gs.stream(true);

			// Register events
			stream.on("data", function(chunk) {
				res.write(chunk);
			});

			stream.on("end", function() {
				// Record the end was called
			});

			stream.on("close", function() {
				res.end();
			});

		});
}

exports.saveFile = function(form, callback){
	// listen on part event for image file
	form.on('file', function(fieldname, file, filename, encoding, mimetype){
		form.forminput.fileId = fileId = new ObjectID();
		// Open a new file
		var gridStore = new GridStore(db, fileId, filename, 'w');

		// Open the new file
		gridStore.open(function(err, gridStore){
			form.forminput.contentType = filename;
			gridStore.contentType = filename;

			file.on('data', function(buf){
				gridStore.write(buf, function(err, gridStore){
					return err;
				});
			});

			file.on('end', function(){
				console.log('File [' + fieldname + '] Finished');
				gridStore.close(callback);
			});
		});
	});

	return form.forminput.fileId;
}

exports.saveArticle = function(input, callback){
	input.date = new Date();
	if(input._id){
		input._id = new ObjectID(input._id);
	}

	db.collection("articles", function(error, collection){
		collection.save(input, {safe: true}, callback);
	});
};