/**
 * Created by vach on 9/13/2014.
 */
var express = require("express"),
	app = module.exports = express(),
	logger = require('morgan'),
	ejs = require('ejs'),
	fs = require('fs'),
	Busboy = require('busboy'),
	article = require("./article"),
	list = fs.readFileSync(__dirname + '/views/list.html', 'utf8'),
	head = fs.readFileSync(__dirname + '/views/head.html', 'utf8'),
	footer = fs.readFileSync(__dirname + '/views/footer.html', 'utf8')
	;

app.use(express.static(__dirname + "/views"));

app.use(logger('dev'));
app.engine('.html', ejs.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// Routes list all articles
app.get("/articles", function(req, res)
{
	res.write(ejs.render(head, {
		filename: 'head',
		cache: true
	}));

	article.findAll(function(error, result)
	{
		if(result instanceof Object){
			res.write(ejs.render(list, {
				result: result,
				cache: true,
				filename: 'list'
			}));
		}

		res.write(ejs.render(footer, {
			filename: 'footer',
			cache: true
		}));

		res.end();
	});
});

app.get("/image/:id", function(req, res){
	article.image(req.params.id, res, function(error, result){
		if(error){
//			res.json(error, 400);
		}else if(!result){
//			res.send(404);
		}else{
		}
		res.end();
	});
});

app.get("/article/:id", function(req, res){
	res.write(ejs.render(head, {
		filename: 'head',
		cache: true
	}));

	article.findById(req.params.id, function(error, result){
		if(error){
			res.status(400);
		}else if(!result){
			res.status(404);
		}else{
			res.write(ejs.render(list, {
				result: result,
				cache: true,
				filename: "list"
			}));
		}
		res.end();
	});
});

app.get("/article/:id/remove", function(req, res){
	article.removeById(req.params.id, function(error, result){
		if(error){
			res.status(400);
		}

		res.redirect('/articles');
//			res.contentType(result.imageType);
//			res.end(result.image.buffer, "binary");
		res.end();
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

	form.input = input;

	article.saveFile(form, function(err, gridStore){
		console.dir(err, gridStore);
	});

	form.on('finish', function(){
		article.saveArticle(input, function(err, objects){
			if(err){
				res.status(400);
				console.log(err.message);
			}else if(objects === 1){      //update
				res.redirect('/article/' + input._id);
//				res.json(input, 200);
			}else{                        //insert
				res.redirect('/article/' + input._id);
				//				res.json(input, 201);
			}
		});
		res.end();
	});
	req.pipe(form);
});

if(!module.parent){
	app.listen(3000);
	console.log('Express started on port 3000');
}