/**
 * Created by vach on 9/22/2014.
 */
exports = module.exports = function(options){
	options = options || {};

	if(process.env.NODE_ENV !== 'test'){
		console.warn('connect.multipart() will be removed in connect 3.0');
		console.warn('visit https://github.com/senchalabs/connect/wiki/Connect-3.0 for alternatives');
	}

	var limit = _limit(options.limit || '100mb');

	return function multipart(req, res, next){
		if(req._body) return next();
		req.body = req.body || {};
		req.files = req.files || {};

		if(!utils.hasBody(req)) return next();

		// ignore GET
		if('GET' == req.method || 'HEAD' == req.method) return next();

		// check Content-Type
		if('multipart/form-data' != utils.mime(req)) return next();

		// flag as parsed
		req._body = true;

		// parse
		limit(req, res, function(err){
			if(err) return next(err);

			var form = new multiparty.Form(options)
				, data = {}
				, files = {}
				, done;

			Object.keys(options).forEach(function(key){
				form[key] = options[key];
			});

			function ondata(name, val, data){
				if(Array.isArray(data[name])){
					data[name].push(val);
				}else if(data[name]){
					data[name] = [data[name], val];
				}else{
					data[name] = val;
				}
			}

			form.on('field', function(name, val){
				ondata(name, val, data);
			});

			if(!options.defer){
				form.on('file', function(name, val){
					val.name = val.originalFilename;
					val.type = val.headers['content-type'] || null;
					ondata(name, val, files);
				});
			}

			form.on('error', function(err){
				if(!options.defer){
					err.status = 400;
					next(err);
				}
				done = true;
			});

			form.on('close', function(){
				if(done) return;
				try{
					req.body = qs.parse(data);
					req.files = qs.parse(files);
				}catch(err){
					form.emit('error', err);
					return;
				}
				if(!options.defer) next();
			});

			form.parse(req);

			if(options.defer){
				req.form = form;
				next();
			}
		});
	}
};