$('.shop-nav-bar').on('click', function(ev){
	ev.preventDefault();
	var $this = $('.shop-nav');
	if ($this.hasClass('selected')) {
		$this.removeClass('selected');
	} else {
		$this.addClass('selected');
	}
});

$('a[href="/shop-sillipint-drinking-glasses"]').addClass('selected');