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
		collection.find().each(callback);
	});
};

exports.findById = function(id, callback){
	db.collection("articles", function(error, collection){
		collection.findOne({_id: new ObjectID(id)}, callback);
	});
};

exports.removeById = function(id, callback){
	db.collection("articles", function(error, collection){
		collection.findAndRemove({_id: new ObjectID(id)}, function(err, doc){
			if(!doc || typeof doc.fileId === 'undefined'){
				callback({message: 'doc not found'});
				return;
			}

			new GridStore(db, doc.fileId, 'r').open(function(err, gs){
				if(typeof gs === 'undefined') return;

				gs.unlink(callback);
			});

		});
	});
};

exports.image = function(id, res, callback){
	// Open a new file
	new GridStore(db, new ObjectID(id), 'r').open(function(err, gs){
		if(typeof gs === 'undefined'){
			res.status(404);
			res.end();
			return;
		}

		var stream = gs.stream(true);

		// Register events
		stream.on("data", function(chunk){
			res.write(chunk);
		});

		stream.on("end", function(){
			// Record the end was called
		});

		stream.on("close", function(){
			res.end();
		});

	});
}

exports.saveFile = function(form, callback){
	// listen on part event for image file
	form.on('file', function(fieldname, file, filename, encoding, mimetype){
		form.input.fileId = fileId = new ObjectID();
		// Open a new file
		new GridStore(db, fileId, filename, 'w').open(function(err, gridStore){
			form.input.contentType = filename;
			gridStore.contentType = filename;

			file.on('data', function(buf){
				gridStore.write(buf, function(err, gridStore){
					return err, gridStore;
				});
			});

			file.on('end', function(){
				gridStore.close(callback);
				console.log('File [' + fieldname + '] Finished');
				callback({error: 0, gs: gridStore});
			});
		});
	});
}

exports.saveArticle = function(input, callback){
	input.date = new Date();
	if(!input._id){
		input._id = new ObjectID(input._id);
	}

	db.collection("articles", function(error, collection){
		collection.save(input, {safe: true}, callback);
	});
};