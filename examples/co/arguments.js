/**
 * Created by vach on 10/3/2014.
 */
var thunk = require('thunkify');
var co = require('co');
var fs = require('fs');
var read = thunk(fs.readFile);
// parallel
function* sizeGen(file1, file2){
	var a = read(file1);
	var b = read(file2);
	return [
		(yield a).length,
		(yield b).length
	];
}
// use co to wrap generatorFunction into callback style
var size = co(sizeGen);
// use `size` as common async callbck style function
// all arguments will pass to `function* sizeGen`
size('package.json', 'README.md', function (err, res) {
	if (err) return console.error(err);
	console.log(res);
});