// handle desktop > 767 for first viewing
(function(){
	var $w = $(window);
	if ($w.width() > 767) {
		$('.promo').css({ height: $w.height() - 93 }).find('img').hide();
		$w.one('resize', function(){
			$('.promo').css({ height: 'auto' }).find('img').show();
		});
	}
})();
