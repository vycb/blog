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
	form = fs.readFileSync(__dirname + '/views/form.html', 'utf8')
	;
app.use(logger('dev'));
app.disable('etag');
app.engine('.html', ejs.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// Routes list all articles adn / root
app.get("/articles", index);

app.get("/", index);

/**
 * routing function for index/show articles
 * @param req
 * @param res
 */
function index(req, res)
{
	res.write(ejs.render(head, {
		filename: 'head',
		cache: true
	}));

	article.findAll(function(error, result)
	{
		if(result){
			res.write(ejs.render(list, {
				result: !result ? {} : result,
				cache: true,
				orempty: app.locals.orempty,
				filename: 'list'
			}));
		}
		else{
			res.write(ejs.render(footer, {
				filename: 'footer',
				cache: true
			}));

			res.end();
		}
	});
}

/**
 * route to get image
 */
app.get("/image/:id", function(req, res){
	article.image(req.params.id, res, function(error, result){
		if(error){
			console.log(error);
//			res.json(error, 400);
		}else if(!result){
//			res.send(404);
		}
		res.end();
	});
});

/**
 * route to show/edit article
 */
app.get("/article/:id", function(req, res){
	res.write(ejs.render(head, {
		filename: 'head',
		cache: true
	}));

	article.findById(req.params.id, function(error, result){
		if(error){
			res.status(400);
			console.log(error);
		}else if(!result){
			res.status(404);
		}

		res.write(ejs.render(form, {
			result: result,
			cache: true,
			orempty: app.locals.orempty,
			filename: "form"
		}));

		res.end();
	});
});

/**
 * route to remove article
 */
app.get("/article/:id/remove", function(req, res){
	article.removeById(req.params.id, function(error, result){
		if(error){
			res.status(400);
			console.log(error.message);
		}

		res.redirect('/articles');
//			res.contentType(result.imageType);
//			res.end(result.image.buffer, "binary");
		res.end();
	});
});

/**
 * route to save/update an article by POST
 */
app.post("/article", function(req, res, next){
	var form = new Busboy({ headers: req.headers }),
			input = {};

	form.on('field', function(name, val, fieldnameTruncated, valTruncated){
		if(name == 'author' && val){
			input.author = val;
		}
		if(name == 'content' && val){
			input.content = val;
		}
		if(name == '_id' && val){
			input._id = val;
		}
		if(name == 'prevFileId' && val){
			input.prevFileId = input.fileId = val;
		}
	});

	form.input = input;

	article.saveFile(form, function(err, gridStore){
		console.log(err, gridStore);
	});

	form.on('finish', function(){
		article.saveArticle(input, function(err, objects){
			if(err){
				res.status(400);
				console.log(err.message);
			}
			res.headers = null;
			res.redirect('/article/' + input._id);
			res.end();
		});
	});
	req.pipe(form);
});

/**
 * route to show article's form
 */
app.get("/form", function(req, res){
	res.write(ejs.render(head, {
		filename: 'head',
		cache: true
	}));

	res.write(ejs.render(form, {
		result: {},
		cache: true,
		orempty: app.locals.orempty,
		filename: "form"
	}));

	res.write(ejs.render(footer, {
		filename: 'footer',
		cache: true
	}));
	res.end();
});

app.use(express.static(__dirname + "/views"));

app.locals.orempty = function(val){
	return (typeof val === 'undefined' ? '' : val);
};

if(!module.parent){
	app.listen(3000);
	console.log('Express started on port 3000');
}