
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('users', {
	  title: 'Express'
	  ,reasons: [
		"Razor Syntax"
		,"Still HTML"
		,"You can macro your macros into your macros, if you want"
        ,users = [
          { name: 'tobi', email: 'tobi@learnboost.com' },
          { name: 'loki', email: 'loki@learnboost.com' },
          { name: 'jane', email: 'jane@learnboost.com' }
          ]
	  ]
  });
};
