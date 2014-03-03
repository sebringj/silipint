module.exports = {
	getLayoutData : getLayoutData,
	getPageId : getPageId,
	getNavId : getNavId
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