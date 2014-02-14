var globalContext;

var routes = require('./routes.js');

var routeHandlers = {};

module.exports.set = function(context) {
	globalContext = context;
	var app = context.app, route;
	for(var i = 0; i < routes.length; i++) {
		route = routes[i];
		app.get(route.path, routeHandlers[ route.method ]);
	}
	
	// error pages
	app.use(function(req, res, next) {
		res.status(404);
		if (req.accepts('html')) {
			res.render('404', {
				title : '404',
				description: 'The page you requested could not be found'
			});
			return;
		}
		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}
		// default to plain-text. send()
		res.type('txt').send('Not found');
	});
	
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		console.log(err);
		res.render('500', { error: err });
	});
};

routeHandlers.home = function(req, res) {
	var products = [];
	for(var i = 0; i < 40; i++) {
		products.push({
			index : (i+1),
		});
	}
	res.render('index', {
		products : products
	});
};

routeHandlers.shop = function(req, res) {
	res.render('shop', {
		
	});
};

routeHandlers.collection = function(req, res) {
	var products = [], i, pages = [], page, href;
	for(i = 0; i < 16; i++) {
		products.push({
			index : (i+1),
		});
	}
	var path = req.path.split('/');
	var nextlink = null, prevlink = null;
	var page = 1;
	if (path.length > 3) {
		page = parseInt(path.pop());
		nextlink		
	}
	path = path.join('/');
	for(i = 0; i < 20; i++) {
		page = (i+1)+'';
		if (i === 0) {
			href = path;
		} else {
			href = path + '/' + page;
		}
		pages.push({
			label : page,
			href : href
		});
	}
	res.render('collection', {
		products : products,
		pages : pages
	});
};

routeHandlers.sililife = function(req, res) {
	res.json({ route: 'sililife', message : 'undefined' });
};

routeHandlers.content = function(req, res) {
	res.json({ route: 'content', message : 'undefined' });
};

routeHandlers.contactus = function(req, res) {
	res.json({ route: 'contactus', message : 'undefined' });
};

routeHandlers.account = function(req, res) {
	res.json({ route: 'account', message : 'undefined' });
};

routeHandlers.findaretailer = function(req, res) {
	res.json({ route: 'findaretailer', message : 'undefined' });
};

routeHandlers.findaretailer = function(req, res) {
	res.json({ route: 'findaretailer', message : 'undefined' });
};

routeHandlers.customize = function(req, res) {
	res.json({ route: 'customize', message : 'undefined' });
};

routeHandlers.cart = function(req, res) {
	res.json({ route: 'cart', message : 'undefined' });
};

routeHandlers.checkout = function(req, res) {
	res.json({ route: 'checkout', message : 'undefined' });
};


