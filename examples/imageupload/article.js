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

/**
 * remove an articles from collection
 * @param id
 * @param callback
 */
exports.removeById = function(id, callback){
	if(!id) return;

	gcollection.findAndRemove({_id: new ObjectID(id)}, function(err, doc){
		if(!doc || !doc.fileId){
			callback(err, {message: 'doc not found'});
			return;
		}

		exports.fileUnlink(doc.fileId, function(err, gs){
				console.log(err, {message: 'fileUnlink ok'});
		});

	});
};

exports.fileUnlink = function(id, callback){
	if(!id) return;

	new GridStore(db, new ObjectID(id), 'r').open(function(err, gs){
		if(!gs){
			callback({error: err, message: 'file not found'}, gs);
			return;
		}

		gs.unlink(callback);

	});
};

/**
 * get an image from collection
 * @param id
 * @param res
 * @param callback
 */
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
};

exports.saveFile = function(form, callback){
	// listen on part event for image file
	form.on('file', function(fieldname, file, filename, encoding, mimetype)
	{

		form.apinput.fileId = form.apinput.prevFileId ? new ObjectID(form.apinput.prevFileId): new ObjectID(form.apinput.fileId);

		// Open a new file or prevFileId to overwrite
		new GridStore(db, form.apinput.fileId, filename, 'w').open(function(err, gs)
		{
			form.apinput.contentType = filename;
			gs.contentType = filename;

			file.on('data', function(buf)
			{
				gs.write(buf, function(err, gs)
				{
					console.log('On data: ', err);
				});
			});

			file.on('end', function(err)
			{
				gs.close(callback);

				console.log('File [' + fieldname + '] Finished');
				callback(err, gs);
			});
		});
	});
};

exports.saveArticle = function(input, callback){
	input.date = new Date();
	if(input._id){
		input._id = new ObjectID(input._id);
	}
	if(!input.fileId){
		delete input.fileId;
	}
	delete input.prevFileId;

	gcollection.save(input, {safe: true}, callback);
};