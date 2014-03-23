var express = require('express'),
	config = require('config'),
	app = express(),
	port = (process.env.PORT || 3003),
	server = app.listen(port),
	controllers = require('./controllers'),
	http = require('http'),
	path = require('path'),
	cons = require('consolidate'),
	nunjucks = require('./lib/nunjucks.js'),
	cache = {},
	mcapi = require('mailchimp-api'),
	middleware = require('./controllers/middleware.js')
	context = {
		app : app,
		cache : cache,
		mailchimp : (new mcapi.Mailchimp(config.mailchimp.apikey))
	};
	
nunjucks.set(app);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
middleware.set(context);
app.use(app.router);
app.use(express.favicon(__dirname + '/public/favicon.ico'));

controllers.set(context);
console.log('running on port ' + port);