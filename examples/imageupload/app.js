/**
 * Created by vach on 9/13/2014.
 */
var express = require("express"),
	logger = require('morgan'),
	app = module.exports = express(),
//	bodyParser = require('body-parser'),
	multiparty = require('multiparty'),
	util = require('util'),
	format = util.format,
	article = require("./article"); // I encapsulated my data objects in a dedicated class

app.use(logger('dev'));
app.use(express.static(__dirname + "/views"));
//app.use(bodyParser.urlencoded());

// Routes list all articles
app.get("/articles", function(req, res){
	article.findAll(function(error, results){
		if(error){
			res.json(error, 400);
		}else if(!results){
			res.send(404);
		}else{
			var i = 0, stop = results.length;

			for(i; i < stop; i++){
				results[i].image = undefined;
			}

			res.json(results);
		}
	});
});

// get the JSON representation of just one article
app.get("/article/:id", function(req, res){
	article.findById(req.params.id, function(error, result){
		if(error){
			res.json(error, 400);
		}else if(!result){
			res.send(404);
		}else{
			result.image = undefined;
			res.json(result);
		}
	});
});

// get the image of a particular article
app.get("/article/:id/image", function(req, res){
	article.findById(req.params.id, function(error, result){
		if(error){
			res.json(error, 400);
		}else if(!result || !result.imageType || !result.image || !result.image.buffer || !result.image.buffer.length){
			res.send(404);
		}else{
			res.contentType(result.imageType);
			res.end(result.image.buffer, "binary");
		}
	});
});

// save/update a new article
app.post("/article", function(req, res, next){
	var form = new multiparty.Form(),
		imageData, input = {}
	input.image = {};

	form.on('error', next);
	form.on('field', function(name, val){
		if(name == 'author'){
			input.author = val;
			/*
			 if(!input.author){
			 res.json("author must be specified when saving a new article", 400);
			 }*/
		}

		if(name == 'content'){
			input.content = val;
			/*if(!input.content){
			 res.json("content must be specified when saving a new article", 400);
			 }*/
		}
	});

	// listen on part event for image file
	form.on('part', function(part){
		if(!part.filename) return;
		if(part.name !== 'image') return part.resume();

		input.image.filename = part.filename;
		input.image.size = part.byteCount;
		part.on('data', function(buf){
//			debugger;
			imageData += buf;
		});
	});

	form.on('close', function(){
		article.save(input, imageData, function(err, objects){
			if(err){
				res.json(err.message, 400);
			}else if(objects === 1){     //update
				input.image = undefined;
				res.json(input, 200);
			}else{                        //insert
				input.image = undefined;
				res.json(input, 201);
			}
		});

		/*res.send(format('\nuploaded %s (%d Kb) as %s'
			, input.image.filename
			, input.image.size / 1024 | 0
			, input.author));*/
	});

	form.parse(req);
});

if(!module.parent){
	app.listen(3000);
	console.log('Express started on port 3000');
}

/*
 app.listen(3000);
 console.log(format("Express server listening on port %d in %s mode", app.address().port, app.settings.env));*/
