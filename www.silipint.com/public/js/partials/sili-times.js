$('.sili-times .bar a').click(function(ev){
	ev.preventDefault();
	console.log('here');
	var $this = $(this), $slider = $this.closest('.sili-times'),
	$productsContainer = $slider.find('.boxes2'),
	$products = $slider.find('.box');
	var pw = 0;
	$products.each(function(){
		pw += $(this).outerWidth();
	});
	var sl = $productsContainer.scrollLeft(),
	sw = $slider.outerWidth(),
	m = Math.floor( (sw/pw) * $products.length ),
	u = (pw / $products.length),
	sign = $this.hasClass('l-arrow') ? '-=' : '+=';
	if (m < 1) { m = 1; }
	var s = (u * m), onLeft = $productsContainer.scrollLeft(), onRight = 0;
	$('.sili-times .bar a').removeClass('disabled');
	if ($this.hasClass('r-arrow')) {
		onRight = (pw - onLeft - sw) - s;
		if (onRight < u/2) {
			s = (pw - onLeft - sw);
			$('.sili-times .bar a.r-arrow').addClass('disabled');
		}
	} else {
		if (onLeft - s < u/2) {
			s = onLeft;
			$('.sili-times .bar a.l-arrow').addClass('disabled');
		}
	}
	
	$productsContainer.stop(true,true).animate({ 
		scrollLeft : sign + s
	},500);
});