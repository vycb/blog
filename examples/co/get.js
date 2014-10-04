/**
 * Created by vach on 10/3/2014.
 */
var request = require('request');
var thunk = require('thunkify');
var co = require('co');
var get = thunk(request.get);
// measure response time N times
function *latency(url, times) {
	var ret = [];
	while (times--) {
		var start = new Date;
		yield get(url);
		ret.push(new Date - start);
	}
	return ret;
}
// run each test in sequence
co(function *(){
	var a = yield latency('http://google.com', 5);
	console.log('a:', a);
	var b = yield latency('http://yahoo.com', 5);
	console.log('b: ', b);
	var c = yield latency('http://cloudup.com', 5);
	console.log('c: ', c);
})()
// run each test in parallel, order is retained
co(function *(){
	var a = latency('http://google.com', 5);
	var b = latency('http://yahoo.com', 5);
	var c = latency('http://cloudup.com', 5);
	var res = yield {a: a, b: b, c: c};
	console.log(res);
})()