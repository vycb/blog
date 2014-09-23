/**
 * Created by vach on 9/13/2014.
 */
var MongoDb = require("mongodb"),
    ObjectID = MongoDb.ObjectID,
    db = new MongoDb.Db("blog", new MongoDb.Server("mongodb://vycb:123@ds039010.mongolab.com", 39010, {auto_reconnect: true}, {})),
    fs = require("fs");

db.open(function(err, db){
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

exports.save = function(input, data, callback){
	input.date = new Date();
	if(input._id){
		input._id = new ObjectID(input._id);
	}

	if(data){
//  var data = fs.readFileSync(image.path);
		input.imageData = new MongoDb.Binary(data);
	}

	db.collection("articles", function(error, collection){
		collection.save(input, {safe: true}, callback);
	});
};