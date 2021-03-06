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
	mongolabcon = 'mongodb://vycb:123@ds039010.mongolab.com:39010/blog',
	localcon = 'mongodb://localhost:27017/blog',
	gcollection,
	db;
// Initialize connection once
MongoClient.connect(mongolabcon,{db: {native_parser: true}}, function(err, database){
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

	gcollection.findAndRemove({_id: new ObjectID(id)}, [['_id', 1]], function(err, doc){
		if(!doc){
			return callback({message: 'doc not found', err: err});
		}

		exports.fileUnlink(doc.fileId, function(err, result){
			console.log('fileUnlink: callback');
			return callback(err, result);
		});
	});
};

exports.fileUnlink = function(id, callback){
	if(!id){
		callback('fileUnlink: no id');
		return;
	}

	new GridStore(db, new ObjectID(id), 'r').open(function(err, gs){
		if(!gs){
			return callback({error: err, message: 'file not found'});
		}

		gs.unlink(function(err, result){
			gs.close(function(err, result){

				console.log(['in unlink ok', result ? result.filename : result]);

				return callback(err, result);
			});
		});
	});
};

/**
 * get an image from collection
 * @param id
 * @param res
 * @param callback
 */
exports.image = function(id, res, callback){
	if(!id){
		return callback('image: no id');
	}
	// Open a new file
	new GridStore(db, new ObjectID(id), 'r').open(function(err, gs){
		if(!gs){
			res.status(404);

			res.end();

			return callback("Image(): GridStore is undefined");
		}

		var stream = gs.stream(true);

		// Register events
		stream.on("data", function(chunk){
			res.write(chunk);
		});

		stream.on("end", callback);

		stream.on("close", function(){
			res.end();

			gs.close(callback);
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
			if(!gs){
				res.status(404);

				return callback({message: "GridStore is undefined"});
			}

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