var config = require('config');

module.exports = {
	getLayoutData : getLayoutData,
	getPageId : getPageId,
	getNavId : getNavId,
	fixForCDN : fixForCDN
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