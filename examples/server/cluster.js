/**
 * Created by vach on 9/28/2014.
 */
var cluster = require('cluster'),
		http = require('http'),
		util = require('util'),
		numCPUs = require('os').cpus().length;

if(cluster.isMaster){
	// Fork workers.
	for(var i = 0; i < numCPUs; i++){
		cluster.fork();
	}

	console.log(numCPUs);

	cluster.on('exit', function(worker, code, signal){
		console.log('worker ' + worker.process.pid + ' died');
	});

	util.log(req.method.toString());

}else{
	// Workers can share any TCP connection
	// In this case its a HTTP server
	http.createServer(function(req, res){


	util.log(req.method.toString());
	}).listen(3000);
}