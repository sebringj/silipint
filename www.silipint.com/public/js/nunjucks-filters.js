(function(){
	var filters = [
		{
			name : 'stringify',
			func : function(str) {
				if (str) {
					return JSON.stringify(str);
				}
			    return '';
			},
			async : false
		},
		{
			name : 'cur',
			func : function(num){
				if (typeof num !== 'number') { return '$0.00'; }
				return '$' + num.toFixed(2);
			},
			async : false
		},
		{
			name : 'striptags',
			func : function(str) {
				if (typeof str !== 'string') { return ''; }
				return str.replace(/(<([^>]+)>)/ig,'');
			},
			async : false
		},
		{
			name : 'mi',
			func : function(num) {
				return num.toFixed(2);
			},
			async : false
		},
		{
			name : 'googleDirections',
			func : function(location) {
				return 'http://maps.google.com/maps?daddr=' + 
				encodeURIComponent('"'+ location.Street + ', ' + location.City + ', ' + location.StateCode + '"');
			},
			async : false
		}
	];
	if (typeof exports === 'undefined') {
		var env = new nunjucks.Environment();
		for(var i = 0; i < filters.length; i++) {
			env.addFilter(filters[i].name, filters[i].func, filters[i].async);
		}
		window.silipint = window.silipint || {}; 
		silipint.nunjucks = env;
	} else {
		module.exports = filters;
	}
	
	function abbreviateNumber(value) {
	    var newValue = value;
	    if (value >= 1000) {
	        var suffixes = ["", "k", "m", "b","t"];
	        var suffixNum = Math.floor( (""+value).length/3 );
	        var shortValue = '';
	        for (var precision = 2; precision >= 1; precision--) {
	            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
	            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
	            if (dotLessShortValue.length <= 2) { break; }
	        }
	        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
	        newValue = shortValue+suffixes[suffixNum];
	    }
	    return newValue;
	}	
})();