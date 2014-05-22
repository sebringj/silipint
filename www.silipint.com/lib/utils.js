var config = require('config');

var productURLPatterns = [
	/oz$/
];

module.exports = {
	getLayoutData : getLayoutData,
	getPageId : getPageId,
	getNavId : getNavId,
	fixForCDN : fixForCDN,
	getProductURL : getProductURL
};

function getPageId(path) {
	return path.replace(/[^a-z0-9]/gi,'-').replace(/-+/gi,'-');
}
function getNavId(path) {
	return getPageId(path.substr(1).split('/')[0]);
}

function getLayoutData(req) {
	return {
		year : (new DateTime().getFullYear())
	};
}

function fixForCDN(url) {
	if (url.indexOf('//') < 0) { return url; }
	var parts = url.split('//')[1].split('/');
	parts.splice(0,2);
	return '//' + config.cdn + '/' + parts.join('/');
}

function getProductURL(product) {
	var i, j;
	var tags = product.tags;
	for(i = 0; i < tags.length; i++) {
		for(j = 0; j < productURLPatterns.length; j++) {
			if (productURLPatterns[j].test(tags[i])) {
				return tags[i];
			}
		}
	}
	return product.productURL;
}