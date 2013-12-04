var express = require('express'),
	config = require('config'),
	app = express(),
	port = (process.env.PORT || 3003),
	server = app.listen(port),
	controllers = require('./controllers'),
	http = require('http'),
	path = require('path'),
	cons = require('consolidate'),
	swig = require('swig'),
	cache = {},
	mcapi = require('mailchimp-api'),
	context = {
		app : app,
		cache : cache,
		mailchimp : (new mcapi.Mailchimp(config.mailchimp.apikey))
	};
	
app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('view cache', false);
app.set('views', __dirname + '/views');
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/favicon.ico'));

controllers.set(context);
console.log('running on port ' + port);