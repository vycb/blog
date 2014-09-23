/**
 * Created by vach on 9/13/2014.
 */
var express = require("express"),
	logger = require('morgan'),
	app = module.exports = express(),
	Busboy = require('busboy'),
	util = require('util'),
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
				res.write('<p><b></b>Autor:</b><a href="/article/'
					+results[i]._id +'">'
					+results[i].author+"</a></p>");

				res.write('<p><b></b>Content: </b></b>'
					+results[i].content+"</p>");

				res.write('<img src="/image/'+results[i].fileId+'"/>');
			}

			res.end();
		}
	});
})

app.get("/image/:id", function(req, res){
	article.image(req.params.id, res, function(error, result){
		if(error){
			res.json(error, 400);
		}else if(!result){
			res.send(404);
		}else{
			return;
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

			res.write('<p><b></b>Autor:</b><a href="/article/'
				+ result._id +'">'
				+ result.author+"</a></p>");

			res.write('<p><b></b>Content: </b></b>'
				+ result.content+"</p>");

			res.write('<img src="/image/'+ result.fileId+'"/>');

			res.end();
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
	var form = new Busboy({ headers: req.headers }),
	input = {};

	form.on('field', function(name, val, fieldnameTruncated, valTruncated){
		if(name == 'author'){
			input.author = val;
		}

		if(name == 'content'){
			input.content = val;
		}
	});

	form.forminput = input;

	article.saveFile(form, function(err, gridStore){
		console.dir(err);
	});

	form.on('finish', function(){
		article.saveArticle(input, function(err, objects){
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
	});

	return req.pipe(form);
});

if(!module.parent){
	app.listen(3000);
	console.log('Express started on port 3000');
}