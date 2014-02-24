var kitgui = require('kitgui'),
config = require('config');

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
		kitgui.getContents({
			basePath : config.kitgui.basePath,
			host : config.kitgui.host,
			items : [
				/*{ id : 'homeNavItem1', editorType : 'inline' },*/
			]
		}, function(kg){
			context.cache.layout = {
				items : kg.items
			};
			console.log(kg.items);
			next();
		});
	});
}