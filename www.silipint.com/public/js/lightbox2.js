setTimeout(function(){
	if(!$('.lb2').not('[data-set]').find('img').length) { return; }
	
	var $img = $('.lb2').attr('data-set','1').find('img:first');
	$img.removeAttr('style');
	$img.addClass('img-responsive');
	
	var href = 'http://www.pinterest.com/pin/create/button/?' + 
	'url=' + encodeURIComponent(location.href) + 
	'&amp;media=' + encodeURIComponent($img.attr('src')) +
	'&amp;description=' + encodeURIComponent($('h1').text());
	
	$('.pin-it-ph').replaceWith(
		$('<a>',{
			href : href,
			'data-pin-do' : 'buttonPin',
			'data-pin-config' : 'above'
		}).append(
			$('<img>',{ src : '//assets.pinterest.com/images/pidgets/pin_it_button.png' })
		)
	);
},0);