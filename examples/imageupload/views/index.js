/**
 * Created by vach on 9/27/2014.
 */
var ejs = require('ejs'),
		fs = require('fs')
;

exports.list = ejs.compile(fs.readFileSync(__dirname + '/list.html', 'utf8'),{filename: 'list'});

exports.head = ejs.compile(fs.readFileSync(__dirname + '/head.html', 'utf8'), {filename: 'head'});

exports.footer = ejs.compile(fs.readFileSync(__dirname + '/footer.html', 'utf8'), {filename: 'footer'});

exports.form = ejs.compile(fs.readFileSync(__dirname + '/form.html', 'utf8'), {filename: __dirname+'/form.html'});

exports.e404 = ejs.compile(fs.readFileSync(__dirname + '/404.html', 'utf8'), {filename: 'e404'});

exports.orempty = function(val){
	return ((!val || typeof val === 'undefined') ? '' : val);
};