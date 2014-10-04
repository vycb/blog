/**
 * Created by vach on 9/28/2014.
 */
var /*cluster = require('cluster'),*/
		cluster = {},
		http = require('http'),
		fixedExecArgv=[];

/*fixedExecArgv.push('--debug=5859');

cluster.setupMaster({
	execArgv: fixedExecArgv
});*/

if(cluster.isMaster){
	// Keep track of http requests
	var numReqs = 0;
	setInterval(function(){
		console.log("numReqs =", numReqs);
	}, 120000);

	// Count requestes
	function messageHandler(msg){
		if(msg.cmd && msg.cmd == 'notifyRequest'){
			numReqs += 1;
		}
	}

	// Start workers and listen for messages containing notifyRequest
	var numCPUs = require('os').cpus().length;
	for(var i = 0; i < numCPUs; i++){
		var worker = cluster.fork();
		console.log("Launched a new worker with PID=", { pid: worker.pid });
	}

	Object.keys(cluster.workers).forEach(function(id){
		cluster.workers[id].on('message', messageHandler);
	});

}else{

	// Worker processes have a http server.
	http.Server(function(req, res){
		res.writeHead(200);
		res.end("hello world\n"+ numReqs);

		// notify master about the request
//		process.send({ cmd: 'notifyRequest' });

	}).listen(3000);
}