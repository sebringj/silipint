module.exports.set = function(context) {
	var app = context.app;
	app.get('/',home);
};

function home(req, res) {
	var products = [];
	for(var i = 0; i < 40; i++) {
		products.push({
			index : (i+1),
		});
	}
	res.render('index', {
		products : products
	});
}