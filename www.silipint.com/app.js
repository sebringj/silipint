var express = require('express'),
	config = require('config'),
	app = express(),
	port = (process.env.PORT || 3003),
	securePort = (process.env.SECUREPORT || 3004),
	controllers = require('./controllers'),
	http = require('http'),
	path = require('path'),
	cons = require('consolidate'),
	nunjucks = require('./lib/nunjucks.js'),
	cache = {},
	mcapi = require('mailchimp-api'),
	middleware = require('./controllers/middleware.js'),
	winston = require('winston'),
	domain = require('domain'),
	d = domain.create(),
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



d.on('error', function(err){
	winston.log('error',err);
	winston.log('info','closing down server at ' + (new Date()).toString() + '\r\n\r\n');
	process.exit(1);
});

d.run(function(){
	
	winston.add(winston.transports.File, { filename: 'winston.log' });
	winston.remove(winston.transports.Console);
	
	winston.log('info','starting server at ' + (new Date()).toString() + '\r\n');
	
	http.createServer(app).listen(process.env.PORT || port);
	https.createServer({
		key : fs.readFileSync('./wildcard.silipint.com.key').toString(),
		cert : fs.readFileSync('./wildcard.silipint.com.crt').toString(),
		ca : fs.readFileSync('./intermediate.crt').toString(),
		passphrase : 'Abc123!~!'
	},app).listen(process.env.SECUREPORT || securePort);

	console.log('HTTP on port ' + (process.env.PORT || port));
	console.log('HTTPS on port ' + (process.env.SecurePORT || securePort));	
	
});