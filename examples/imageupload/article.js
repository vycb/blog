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
	gcollection,
	db;
// Initialize connection once
MongoClient.connect("mongodb://vycb:123@ds039010.mongolab.com:39010/blog",{db: {native_parser: false}}, function(err, database){
	if(err) throw err;

	db = database;

	db.collection("articles", function(error, coll){
		gcollection = coll;
	});
});

exports.findAll = function(callback){
	gcollection.find().each(callback);
};

exports.findById = function(id, callback){
	gcollection.findOne({_id: new ObjectID(id)}, callback);
};

exports.removeById = function(id, callback){
	gcollection.findAndRemove({_id: new ObjectID(id)}, function(err, doc){
		if(!doc || !doc.fileId){
			callback({message: 'doc not found'});
			return;
		}

		new GridStore(db, doc.fileId, 'r').open(function(err, gs){
			if(!gs){
				callback({error: 'file not found'});
				return;
			}
			gs.unlink(callback);
		});

	});
};

exports.image = function(id, res, callback){
	if(!id) return;
	// Open a new file
	new GridStore(db, new ObjectID(id), 'r').open(function(err, gs){
		if(typeof gs === 'undefined'){
			res.status(404);
			res.end();
			return callback({message: "GridStore is undefined"});
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
			callback({message: "on close success"});
		});

	});
}

exports.saveFile = function(form, callback){
	// listen on part event for image file
	form.on('file', function(fieldname, file, filename, encoding, mimetype)
	{
		if(form.prevFileId){ //the previous image in doc to be deleted
			new GridStore(db, form.prevFileId, 'r').open(function(err, gs){
				if(!gs){
					callback({error: 'file not found'});
					return;
				}
				gs.unlink(callback);

			});
		}

		form.input.fileId = form.prevFileId? form.prevFileId :new ObjectID();

		// Open a new file or prevFileId to overwrite
		new GridStore(db, form.input.fileId, filename, 'w').open(function(err, gridStore)
		{
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
	if(input._id){
		input._id = new ObjectID(input._id);
	}

	gcollection.save(input, {safe: true}, callback);
};