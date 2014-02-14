$('.products-slider').on('click','.arrow', function(ev){
	ev.preventDefault();
	var $this = $(this), $slider = $this.closest('.products-slider'),
	$productsContainer = $slider.find('.products'),
	$products = $slider.find('.product');
	var pw = 0;
	$products.each(function(){
		pw += $(this).width();
	});
	var sl = $productsContainer.scrollLeft(),
	sw = $slider.width(),
	m = Math.floor( (sw/pw) * $products.length ),
	u = (pw / $products.length),
	sign = $this.hasClass('l-arrow') ? '-=' : '+=';
	if (m < 1) { m = 1; }
	var s = (u * m), onLeft = $productsContainer.scrollLeft(), onRight = 0;
	if ($this.hasClass('r-arrow')) {
		onRight = (pw - onLeft - sw) - s;
		if (onRight < u/2) {
			s = (pw - onLeft - sw);
		}
	} else {
		if (onLeft - s < u/2) {
			s = onLeft;
		}
	}
	$productsContainer.stop(true,true).animate({ 
		scrollLeft : sign + s
	},500);
});