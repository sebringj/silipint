var config = require('config'),
kitgui = require('kitgui'),
utils = require('../lib/utils.js'),
async = require('async'),
getJSON = require('../lib/getJSON.js');

var globalContext;

var routes = require('./routes.js');
var redirects = require('./redirects.js');

var routeHandlers = {};

module.exports.set = function(context) {
	globalContext = context;
	var app = context.app, route, i;
	for(i = 0; i < routes.length; i++) {
		route = routes[i];
		app.get(route.path, routeHandlers[ route.method ]);
	}
	for(i = 0; i < redirects.length; i++) {
		redirect = redirects[i];
		(function(redirect){
			app.get(redirect.path, function(req, res){
				res.redirect(301, redirect.redirect);
			});
		})(redirect);
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
	var pageID = 'home';

	function render() {
		res.render('index', {
			layout : globalContext.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : context.cache[pageID].products
		});
	}
	
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	} else {
		context.cache[pageID] = {};
	}
	async.parallel([
		function(cb) {
			getJSON({port:443, host:'silipint.hubsoft.ws',path:'/api/v1/products?tags=frontpage&extras=1'}, function(status, data) {
				if (data && data.products) {
					context.cache[pageID].products = data.products;
				}
				cb();
			}, function() {
				cb();
			});
		},
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path,
				items : [
					{ id : pageID + 'Collection', editorType : 'sili-json' }
				]
			}, function(kg){
				context.cache[pageID].items = kg.items;
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	], function(err){
		render();
	});	
};

routeHandlers.detail = function(req, res) {
	var pageID = utils.getPageId(req.path);

	function render() {
		var renderObj = {
			layout : globalContext.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			items : context.cache[pageID].items,
			product : context.cache[pageID].product,
			seo : {}
		};
		
		if (!context.cache[pageID].seo.title) {
			renderObj.seo.title = context.cache[pageID].product.pageTitle;
		}
		if (!context.cache[pageID].seo.description) {
			renderObj.seo.description = context.cache[pageID].metaDescription;
		}
		
		if (!renderObj.seo.title) {  renderObj.seo.title = '[fill in]'; }
		
		res.render('detail', renderObj);
	}
	
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	} else {
		context.cache[pageID] = {};
	}
	async.parallel([
		function(cb) {
			getJSON({port:443, host:'silipint.hubsoft.ws',path:'/api/v1/products?productURL=' + req.path }, function(status, data) {
				if (data && data.product) {
					context.cache[pageID].product = data.product;
				} else {
					context.cache[pageID].product = {};
				}
				cb();
			}, function() {
				cb();
			});
		},
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path,
				items : []
			}, function(kg){
				context.cache[pageID].items = kg.items;
				context.cache[pageID].seo = kg.seo;
				cb();
			});
		}
	], function(err){
		render();
	});
}

routeHandlers.shop = function(req, res) {
	res.render('shop', {
		pageID : 'shop',
		kitguiAccountKey : config.kitgui.accountKey
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

routeHandlers.landing = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		var products = [];
		for(var i = 0; i < 40; i++) {
			products.push({
				index : (i+1),
			});
		}
		res.render('landing', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : products
		});
	}
	if (req.cookies.kitgui) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	kitgui.getContents({
		basePath : config.kitgui.basePath,
		host : config.kitgui.host,
		pageID : pageID,
		url : 'http://' + config.domain + req.path,
		items : [
			{ id : navID + 'SubNavLabel', editorType : 'inline' },
			{ id : navID + 'SubNav', editorType : 'links-json' },
			{ id : pageID + 'Collection', editorType : 'sili-json' }
		]
	}, function(kg){
		context.cache[pageID] = {
			items : kg.items,
			title : kg.seo.title,
			description : kg.seo.description
		};
		render();
	});
};

routeHandlers.listing = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		var products = [];
		for(var i = 0; i < 40; i++) {
			products.push({
				index : (i+1),
			});
		}
		res.render('listing', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : products
		});
	}
	if (req.cookies.kitgui) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	kitgui.getContents({
		basePath : config.kitgui.basePath,
		host : config.kitgui.host,
		pageID : pageID,
		url : 'http://' + config.domain + req.path,
		items : [
			{ id : navID + 'SubNavLabel', editorType : 'inline' },
			{ id : navID + 'SubNav', editorType : 'links-json' },
			{ id : pageID + 'Collection', editorType : 'sili-json' }
		]
	}, function(kg){
		context.cache[pageID] = {
			items : kg.items,
			title : kg.seo.title,
			description : kg.seo.description
		};
		render();
	});
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

routeHandlers.lightbox = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		var products = [];
		for(var i = 0; i < 40; i++) {
			products.push({
				index : (i+1),
			});
		}
		res.render('lightbox', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : products
		});
	}
	if (req.cookies.kitgui) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	kitgui.getContents({
		basePath : config.kitgui.basePath,
		host : config.kitgui.host,
		pageID : pageID,
		url : 'http://' + config.domain + req.path,
		items : [
			{ id : navID + 'SubNavLabel', editorType : 'inline' },
			{ id : navID + 'SubNav', editorType : 'links-json' },
			{ id : pageID + 'Images', editorType : 'bootstrap-carousel-json' },
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Html', editorType : 'inline' }
		]
	}, function(kg){
		context.cache[pageID] = {
			items : kg.items,
			title : kg.seo.title,
			description : kg.seo.description
		};
		render();
	});
};
