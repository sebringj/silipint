var kitgui = require('kitgui'),
config = require('config'),
async = require('async'),
getJSON = require('../lib/getJSON.js');

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
		async.parallel([
			function(cb) {
				cb();
				/*
				kitgui.getContents({
					basePath : config.kitgui.basePath,
					host : config.kitgui.host,
					items : [
						// { id : 'homeNavItem1', editorType : 'inline' }
					]
				}, function(kg){
					context.cache.layout.items = kg.items;
					cb();
				});
				*/
			},
			function(cb) {
				getJSON({port:443, host:'api.instagram.com',path:'/v1/users/37417319/media/recent?client_id=4c559d14132d4106812179c7a223840d'}, function(status, data) {
					context.cache.layout.instagram = data;
					console.log(data);
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