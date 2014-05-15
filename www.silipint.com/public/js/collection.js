(function(){
	$('.pages a').removeClass('selected')
	.filter('[data-selected]')
	.addClass('selected');
	
	$('.pages').on('click','a',function(ev){
		ev.preventDefault();
		var $products = $('.products');
		var $a = $(this);
		$('.pages a').removeClass('selected');
		$products.css({ 'height': $products.height(), opacity : 1 });
		var $div = $('<div>');
		
		async.parallel([
			function(cb) {
				var called = false;
				$('html,body').animate({ scrollTop: 0 }, 500, function(){
					if (!called) { cb(); called = true; }
				});
			},
			function(cb) {
				var called = false;
				$div.load($a.attr('href') + ' .products', function(){
					if (!called) { cb(); called = true; }
				});
			},
			function(cb) {
				var called = false;
				$products.animate({opacity : 0}, 250, function(){
					if (!called) { cb(); called = true; }
				});
			}
		], function(err){
			$products.html($div.find('.products').html());
			$products.css({ height: 'auto', opacity: 1 });
			$a.addClass('selected');
		});
	});
	
	$('[data-next]').click(function(){
		var $a = $('.pages a.selected');
		if ($a.next().length) {
			$a.next().trigger('click');
		}
	});
	$('[data-prev]').click(function(){
		var $a = $('.pages a.selected');
		if ($a.prev().length) {
			$a.prev().trigger('click');
		}
	});
})();