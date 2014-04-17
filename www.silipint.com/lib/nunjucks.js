var nunjucks = require('nunjucks');
var fs = require('fs');
var filters = require('../public/js/nunjucks-filters.js');
module.exports.set = function(app) {
	var env = nunjucks.configure('views', {
	    autoescape: true,
	    express: app
	});
	
	for(var i = 0; i < filters.length; i++) {
		env.addFilter(filters[i].name, filters[i].func, filters[i].async);
	}
	
	var templates = nunjucks.precompile('views', { 
		env: env, 
		include : [
			/partials\/cart.html$/,
			/partials\/order-receipt.html$/,
			/partials\/order-review.html$/
		] 
	});
	
	fs.writeFile("public/js/templates.js", templates, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	});
};	