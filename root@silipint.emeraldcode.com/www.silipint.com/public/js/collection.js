(function(){
	console.log(location.pathname)
	$('.pages a').removeClass('selected')
	.filter('a[href="'+ location.pathname +'"]')
	.addClass('selected');
})();