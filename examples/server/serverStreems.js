/**
 * Created by vach on 9/29/2014.
 */
var http = require('http');

var server = http.createServer(function(req, res){
	// req is an http.IncomingMessage, which is a Readable Stream
	// res is an http.ServerResponse, which is a Writable Stream

	var body = '';
	// we want to get the data as utf8 strings
	// If you don't set an encoding, then you'll get Buffer objects
	req.setEncoding('utf8');

	// Readable streams emit 'data' events once a listener is added
	req.on('data', function(chunk){
		body += chunk;
	})

	// the end event tells you that you have entire body
	req.on('end', function(){
		try{
			var data = JSON.parse(body);
		}catch(er){
			// uh oh!  bad json!
			res.statusCode = 400;
			return res.end('error: ' + er.message);
		}

		// write back something interesting to the user:
		res.write(typeof data);
		res.end();
	})
});

server.listen(1337);

// $ curl localhost:1337 -d '{}'
// object
// $ curl localhost:1337 -d '"foo"'
// string
// $ curl localhost:1337 -d 'not json'
// error: Unexpected token o