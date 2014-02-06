// handle desktop > 767 for first viewing
/*
(function(){
	var $w = $(window);
	if ($w.width() > 767) {
		$('.promo').css({ height: $w.height() - 93 }).find('img').hide();
		$w.one('resize', function(){
			$('.promo').css({ height: 'auto' }).find('img').show();
		});
	}
})();
*/
$('.products-slider').on('click','.arrow', function(ev){
	ev.preventDefault();
	var $this = $(this), $slider = $this.closest('.products-slider'),
	$productsContainer = $slider.find('.products'),
	$products = $slider.find('.product');
	console.log($slider.width());
	var pw = 0;
	$products.each(function(){
		pw += $(this).width();
	});
	var sl = $productsContainer.scrollLeft(),
	sw = $slider.width(),
	m = Math.floor( (sw/pw) * $products.length ),
	u = (pw / $products.length),
	sign = $this.hasClass('l-arrow') ? '-=' : '+=';
	var s = (u * m), onLeft = $productsContainer.scrollLeft(), onRight = 0;
	if ($this.hasClass('r-arrow')) {
		onRight = (pw - onLeft - sw) - s;
		if (onRight < u/2) {
			s += u;
		}
	} else {
		if (onLeft - s < u/2) {
			s += u;
		}
	}
	$productsContainer.stop(true,true).animate({ 
		scrollLeft : sign + s
	},500);
});