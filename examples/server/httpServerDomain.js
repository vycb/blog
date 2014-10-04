/**
 * Created by vach on 9/28/2014.
 */
// create a top-level domain for the server
var serverDomain = domain.create();

serverDomain.run(function(){
	// server is created in the scope of serverDomain
	http.createServer(function(req, res){
		// req and res are also created in the scope of serverDomain
		// however, we'd prefer to have a separate domain for each request.
		// create it first thing, and add req and res to it.
		var reqd = domain.create();
		reqd.add(req);
		reqd.add(res);
		reqd.on('error', function(er){
			console.error('Error', er, req.url);
			try{
				res.writeHead(500);
				res.end('Error occurred, sorry.');
			}catch(er){
				console.error('Error sending 500', er, req.url);
			}
		});
	}).listen(3000);
});