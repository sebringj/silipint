var config = require('config'),
kitgui = require('kitgui'),
utils = require('../lib/utils.js'),
async = require('async'),
getJSON = require('../lib/getJSON.js'),
emailer = require('../lib/mailer.js');

var globalContext;

var routes = require('./routes.js');
var redirects = require('./redirects.js');

var routeHandlers = {};

module.exports.set = function(context) {
	
	globalContext = context;
	var app = context.app, route, i, verb;
	for(i = 0; i < routes.length; i++) {
		route = routes[i];
		verb = (route.verb) ? route.verb : 'get';
		app[verb](route.path, routeHandlers[ route.method ]);	
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
			return res.render('404.html', {
				title : '404',
				description: 'The page you requested could not be found'
			});
		}
		// respond with json
		if (req.accepts('json')) {
			return res.send({ error: 'Not found' });
		}
		// default to plain-text. send()
		res.type('txt').send('Not found');
	});
	
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		console.log(err);
		res.render('500.html', { error: err });
	});
};

routeHandlers.refresh = function(req, res) {
	getJSON({port:443, host:'silipint.hubsoft.ws',path:'/api/v1/refresh'}, function(status, data) {
		if (globalContext.cache) {
			for(var i in globalContext.cache) {
				if (globalContext.cache.hasOwnProperty(i)) {
					delete globalContext.cache[i];
				}
			}
		}
		res.end('cleared cache');
	});
}

routeHandlers.home = function(req, res) {
	var pageID = 'home';

	function render() {
		res.render('index.html', {
			layout : globalContext.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path,
				items : [
					{ id : pageID + 'Slider', editorType : 'bootstrap-carousel-json' },
					{ id : pageID + 'Collection', editorType : 'sili-json' },
					{ id : pageID + 'CupsTop', editorType : 'inline' },
					{ id : pageID + 'CupsBottom', editorType : 'inline' }
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
			renderObj.title = context.cache[pageID].product.pageTitle;
		}
		if (!context.cache[pageID].seo.description) {
			renderObj.seo.description = context.cache[pageID].metaDescription;
			renderObj.description = context.cache[pageID].product.metaDescription;
		}
		
		if (!renderObj.seo.title) {  renderObj.seo.title = '[fill in]'; }
		
		res.render('detail.html', renderObj);
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
			var query = '/api/v1/products?extras=1&tags=' + req.path.substr(1);
			if (/-detail$/.test(req.path)) {
				query = '/api/v1/products?productURL=' + req.path;
			}
			getJSON({port:443, host:'silipint.hubsoft.ws',path:query }, function(status, data) {
				if (data && data.product) {
					data.product.productURL = 'http://' + config.domain + data.product.productURL;
					context.cache[pageID].product = data.product;
				} else if(data && data.products && data.products.length) {
					data.products[0].productURL = 'http://' + config.domain + req.path;
					context.cache[pageID].product = data.products[0];
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
				items : [ { id : pageID + 'YellowBox', editorType : 'html' } ]
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
	var cacheKey = utils.getPageId(req.path);
	var pageID = 'shop';
	var navID = 'shop';
	function render() {
		res.render('shop.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
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
			{ id : pageID + 'Collection', editorType : 'listing-json' },
			{ id : pageID + 'YellowBox', editorType : 'html' }
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

routeHandlers.collection = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var page = 1; 
	if (req.query.page) { page = parseInt(req.query.page); }
	if (page > 1) { cacheKey += '-' + page; }
	var pageID = cacheKey;
	var navID = 'shop';
	var limit = 16;
	var pageCount;
	
	
	function render() {
		res.render('collection.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : context.cache[pageID].products,
			pages : context.cache[pageID].pages
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path,
				items : [
					{ id : navID + 'SubNavLabel', editorType : 'inline' },
					{ id : navID + 'SubNav', editorType : 'links-json' },
					{ id : pageID + 'SubNavText2', editorType : 'inline' },
					{ id : pageID + 'SubNavLabel2', editorType : 'inline' },
					{ id : pageID + 'SubNavCTAS', editorType : 'links-json' },
					{ id : pageID + 'Collection', editorType : 'listing-json' },
					{ id : pageID + 'YellowBox', editorType : 'html' }
				]
			}, function(kg){
				context.cache[pageID].items = kg.items;
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		},
		function(cb) {
			getJSON({port:443, host:'silipint.hubsoft.ws',path:'/api/v1/products?extras=1&tags=' + req.path.substr(1) }, function(status, data) {
				if (data && data.products) {
					pageCount = Math.ceil(data.products.length / limit);
					var products = [];
					var start = (page - 1) * limit;
					var max = page * limit;
					var i;
					for(i = start; (i < data.products.length && i < max); i++) {
						if (data.products[i].tags && data.products[i].tags.length) {
							data.products[i].productURL = utils.getProductURL(data.products[i]);
						}
						products.push(data.products[i]);
					}
					context.cache[pageID].products = products;
					var pages = [];
					for(var i = 0; i < pageCount; i++) {
						if (i === 0) {
							pages.push({ href : req.path, label : '1' });
						} else {
							pages.push({ href : req.path + '?page=' + (i+1), label : (i+1) });
						}
						if (page - 1 === i) {
							pages[pages.length-1].isSelected = true;
						}
					}
					context.cache[pageID].pages = pages;
				} else {
					context.cache[pageID].products = {};
				}
				cb();
			}, function() {
				context.cache[pageID].products = {};
				cb();
			});
		}
	],function(err){
		render();
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
		res.render('landing.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			products : products,
			lightbox : ( (req.path === '/customize' || req.path === '/about-silicone' || req.path === '/about-silipint') ? 'data-lightbox' : '' )
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
			{ id : pageID + 'SubNavText2', editorType : 'inline' },
			{ id : pageID + 'SubNavLabel2', editorType : 'inline' },
			{ id : pageID + 'SubNavCTAS', editorType : 'links-json' },
			{ id : pageID + 'Collection', editorType : 'sili-json' },
			{ id : pageID + 'YellowBox', editorType : 'html' }
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
			products.push({ index : (i+1) });
		}
		res.render('listing.html', {
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
			{ id : pageID + 'SubNavText2', editorType : 'inline' },
			{ id : pageID + 'SubNavLabel2', editorType : 'inline' },
			{ id : pageID + 'SubNavCTAS', editorType : 'links-json' },
			{ id : pageID + 'Collection', editorType : 'sili-json' },
			{ id : pageID + 'YellowBox', editorType : 'html' }
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
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'account';
	function render() {
		res.render('account.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.signin = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'signin';
	function render() {
		res.render('sign-in.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.signout = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'signout';
	function render() {
		res.render('sign-out.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.forgotPassword = function(req, res){
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'forgotpassword';
	function render() {
		res.render('forgot-password.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		return render();
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.findaretailer = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('stores.html', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Description', editorType : 'html' }
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

routeHandlers.customize = function(req, res) {
	res.json({ route: 'customize', message : 'undefined' });
};

routeHandlers.cart = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'cart';
	function render() {
		res.render('cart.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.checkout = function(req, res) {
	var years = []; var year = (new Date()).getFullYear();
	for(var i = 0; i < 10; i++) {
		years.push(year+i);
	}
	
	var cacheKey = utils.getPageId(req.path);
	var pageID = utils.getPageId(req.path);
	var navID = 'checkout';
	function render() {
		res.render('checkout.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description,
			years : years
		});
	}
	if (req.cookies.kitgui || req.query.refresh) {
		delete context.cache[pageID];
	}
	if (context.cache[pageID]) {
		render();
		return;
	}
	context.cache[pageID] = {};
	async.parallel([
		function(cb) {
			kitgui.getContents({
				basePath : config.kitgui.basePath,
				host : config.kitgui.host,
				pageID : pageID,
				url : 'http://' + config.domain + req.path
			}, function(kg){
				context.cache[pageID].title = kg.seo.title;
				context.cache[pageID].description = kg.seo.description;
				cb();
			});
		}
	],function(err){
		render();
	});
};

routeHandlers.lightbox = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('lightbox.html', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'SubNavText2', editorType : 'inline' },
			{ id : pageID + 'SubNavLabel2', editorType : 'inline' },
			{ id : pageID + 'SubNavCTAS', editorType : 'links-json' },
			{ id : pageID + 'Images', editorType : 'bootstrap-carousel-json' },
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'HTML1', editorType : 'html' }
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

routeHandlers.lightbox2 = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('lightbox2.html', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'SubNavText2', editorType : 'inline' },
			{ id : pageID + 'SubNavLabel2', editorType : 'inline' },
			{ id : pageID + 'SubNavCTAS', editorType : 'links-json' },
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'HTML1', editorType : 'html' }
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

routeHandlers.content = function(req, res){
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('content.html', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Description', editorType : 'html' }
		]
	}, function(kg){
		context.cache[pageID] = {
			items : kg.items,
			title : kg.seo.title,
			description : kg.seo.description
		};
		render();
	});	
}

routeHandlers.faq = function(req, res){
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('faq.html', {
			layout : context.cache.layout,
			path : 'http://' + config.domain + req.path,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Description', editorType : 'html' },
			{ id : pageID + 'FAQs', editorType : 'faq-json' }
		]
	}, function(kg){
		context.cache[pageID] = {
			items : kg.items,
			title : kg.seo.title,
			description : kg.seo.description
		};
		render();
	});	
}

routeHandlers.shareSili = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('share-sili.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Description', editorType : 'html' },
			{ id : pageID + 'YellowBox', editorType : 'html' }
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

routeHandlers.postSiliShare = function(req, res) {
	var i, entries = [];
	entries.push('<h1>Sili Experience Submission</h1>');
	for(i in req.body) {
		if (i === 'f_vemail') { continue; }
		if (req.body.hasOwnProperty(i)) {
			entries.push('<strong>'+ htmlEncode(i.substr(2)) +'</strong>');
			entries.push('<div style="margin-bottom:10px">'+ htmlEncode(req.body[i]) +'</div>');
		}
	}
	emailer.send({
		to : config.email.to,
		from : config.email.from,
		subject : 'Sili Experience Submission',
		email : config.email.to,
		html : entries.join('')
	}, function(data){
		res.json(data);
	});
}

routeHandlers.customerService = function(req, res) {
	var cacheKey = utils.getPageId(req.path);
	var pageID = cacheKey;
	var navID = utils.getNavId(req.path);
	function render() {
		res.render('customer-service.html', {
			layout : context.cache.layout,
			kitguiAccountKey : config.kitgui.accountKey,
			pageID : pageID,
			navID : navID,
			items : context.cache[pageID].items,
			title : context.cache[pageID].title,
			description : context.cache[pageID].description
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
			{ id : pageID + 'Title', editorType : 'inline' },
			{ id : pageID + 'Description', editorType : 'html' },
			{ id : pageID + 'YellowBox', editorType : 'html' }
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

routeHandlers.postCustomerService = function(req, res) {
	var i, entries = [];
	entries.push('<h1>Customer Webform Inquery</h1>');
	for(i in req.body) {
		if (req.body.hasOwnProperty(i)) {
			entries.push('<strong>'+ htmlEncode(i.substr(2)) +'</strong>');
			entries.push('<div style="margin-bottom:10px">'+ htmlEncode(req.body[i]) +'</div>');
		}
	}
	emailer.send({
		to : config.email.to,
		from : config.email.from,
		subject : 'Customer Webform Inquery',
		email : config.email.to,
		html : entries.join('')
	}, function(data){
		res.json(data);
	});
}

routeHandlers.subscribe = function(req, res) {
	globalContext.mailchimp.lists.subscribe({id: config.mailchimp.listID, email: {email:req.body.email}}, function(data) {
    	res.json(data);
	}, function(error) {
        res.json({ err : error });
	});
};

function htmlEncode(str) {
	if (!str) { return ''; }
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
