/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'),
	GithubView = require('./github-view'),
	logger = require('morgan'),
	md = require('marked').parse,
	app = module.exports = express();

if (!module.parent) app.use(logger('dev'));

// register .md as an engine in express view system
app.engine('md', function(str, options, fn){
  try {
    var html = md(str);
    html = html.replace(/\{([^}]+)\}/g, function(_, name){
      return options[name] || '';
    });
    fn(null, html);
  } catch(err) {
    fn(err);
  }
});

// pointing to a particular github repo to load files from it
//app.set('views', 'strongloop/express');
app.set('views', 'chjj/marked');

// register a new view constructor
app.set('view', GithubView);

app.get('/', function(req, res){
  // rendering a view relative to the repo.
  // app.locals, res.locals, and locals passed
  // work like they normally would
  res.render('doc/todo.md', { title: 'Example' });
});

app.get('/Readme.md', function(req, res){
  // rendering a view from https://github.com/strongloop/express/blob/master/Readme.md
  res.render('README.md');
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
