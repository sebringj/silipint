var kitgui = require('kitgui'),
config = require('config'),
async = require('async'),
getJSON = require('../lib/getJSON.js'),
utils = require('../lib/utils.js');

module.exports.set = function(context){
	setLayoutCache(context);
};

function setLayoutCache(context) {
	context.app.use(function(req, res, next){
		if (req.cookies.kitgui || req.query.refresh) {
			delete context.cache.layout;
		}
		if (context.cache.layout) {
			return next();
		}
		context.cache.layout = {};
		if (req.get('host').indexOf(config.domain) !== 0) {  
			return res.redirect(301,'http://' + req.originalUrl);
		}
		async.parallel([
			function(cb) {
				kitgui.getContents({
					basePath : config.kitgui.basePath,
					host : config.kitgui.host,
					items : [
						{ id : 'topNavFreeShippingMessage', editorType : 'inline' },
						{ id : 'topNavProductsLinks', editorType : 'links-json' },
						{ id : 'topNavSililifeLinks', editorType : 'links-json' },
						{ id : 'topNavCustomizeLinks', editorType : 'links-json' },						
						{ id : 'topNavAccountsLinks', editorType : 'links-json' },
						{ id : 'topNavResourcesLinks', editorType : 'links-json' },
						{ id : 'topNavContactLinks', editorType : 'links-json' },
						{ id : 'topNavContactText', editorType : 'inline' },
						{ id : 'productsSlider', editorType : 'links-json' }
					]
				}, function(kg){
					if (!kg) { kg = { items : []}; }
					context.cache.layout.items = kg.items;
					context.cache.layout.topNav = [
						{ key : 'topNavProductsLinks', icon : 'header-products-CUP.svg' }, 
						{ key : 'topNavAccountsLinks', icon : 'header-accounts-PROFILE.svg' },
						{ key : 'topNavResourcesLinks', icon : 'header-resources-LINES.svg' },
						{ key : 'topNavContactLinks', icon : 'header-contact-SPEECH.svg' }
					];
					context.cache.layout.bottomNav = [
						'topNavProductsLinks', 'topNavSililifeLinks', 
						'topNavCustomizeLinks', 'topNavAccountsLinks',
						'topNavResourcesLinks', 'topNavContactLinks'	
					];
					cb();
				});
			},
			function(cb) {
				getJSON({port:443, host:'api.instagram.com',path:'/v1/users/37417319/media/recent?client_id=4c559d14132d4106812179c7a223840d'}, function(status, data) {
					context.cache.layout.instagram = data;
					cb();
				}, function() {
					cb();
				});
			},
			function(cb) {
				getJSON({port:443, host:'silipint.hubsoft.ws',path:'/api/v1/products?tags=frontpage&extras=1'}, function(status, data) {
					var i, j, product, img;
					if (data && data.products && data.products.length) {
						for(i = 0; i < data.products.length; i++) {
							product = data.products[i];
							if (product.images) {
								for(j = 0; j < product.images.length; j++) {
									product.images[j] = utils.fixForCDN(product.images[j]);
								}
							}
						}
						context.cache.layout.sliderProducts = data.products;
					}
					cb();
				}, function() {
					cb();
				});
			}
		], function(err) {
			next();
		});
	});
}