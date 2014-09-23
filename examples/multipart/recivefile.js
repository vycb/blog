/**
 * Created by vach on 9/21/2014.
 */
var http = require("http"),
multiparty = require("multiparty")
;

function onRequest(req, res, next) {



	if(req.url =='/upload'/* && req.method == "POST"*/)
	{
		var form = new multiparty.Form(),
			file;

		form.on('part', function(part){
			if(!part.filename) return;
			if(part.name !== 'image') return part.resume();

			res.writeHead(200, {
				"Content-Type": "image/jpeg"
			});

			part.on('data', function(buf){
				res.write(buf);
			});
		});



		form.on('close', function(){
			console.log('Upload completed!');
				res.end('');
		});

		form.on('error', function(err){
			err.status = 400;
			next(err);
		});

		form.parse(req);
	}

}

http.createServer(onRequest).listen(3000);
console.log("Server has started.");