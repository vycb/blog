/**
 * Created by vach on 10/3/2014.
 */
var thunkify = require('thunkify');
var assert = require('assert');
var fs = require('fs');

debugger;
function read(file, fn){
	fn(null, 'file: ' + file);
}

read = thunkify(read);
read('foo.txt')(function(err, res){
	assert(!err);
	debugger;
	assert('file: foo.txt' == res);
});

function read(file, fn){
	setTimeout(function(){
		fn(null, 'file: ' + file);
	}, 5);
}
read = thunkify(read);

read('foo.txt')(function(err, res){
	assert(!err);
	assert('file: foo.txt' == res);
});

function load(fn){
	fn(null, this.name);
}
var user = {
	name: 'tobi',
	load: thunkify(load)
};
user.load()(function(err, name){
	if(err) return console.log(err);
	assert('tobi' == name);
});

function load(fn){
	throw new Error('boom');
}
load = thunkify(load);
load()(function(err){
	assert(err);
	debugger;
	assert('boom' == err.message);
});

function load(fn){
	fn(null, 1);
	fn(null, 2);
	fn(null, 3);
}
load = thunkify(load);
load()(done);

function read(file, fn){
	setTimeout(function(){
		fn(null, file[0], file[1]);
	}, 5);
}
read = thunkify(read);
read('foo.txt')(function(err, a, b){
	assert(!err);
	assert('f' == a);
	assert('o' == b);
});

fs.readFile = thunkify(fs.readFile);
fs.readFile('package.json')(function(err, buf){
	assert(!err);
	assert(Buffer.isBuffer(buf));
	fs.readFile('package.json', 'utf8')(function(err, str){
		assert(!err);
		assert('string' == typeof str);
	});
});