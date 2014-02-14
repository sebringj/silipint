(function($w){
	// enable popout menu
	$w.resize(function(){
		var iof = 'iosorientationfix';
		$('#mobileMenu .nav').css({
			height: 10000
		});
		if ($w.data(iof)) {
			clearInterval($w.data(iof));
		}
		$w.data(iof, setTimeout(function(){
			var h = $(window).height();
			$('#mobileMenu .nav').css({
				height: h + 20
			});
		},10));
	});
	// handle menu toggle as quick as possible for mobile
	(function() { 
		function handleToggle(ev) {
			ev.preventDefault();
			if ($('body').hasClass('menuOpen')) {
				$('body').removeClass('menuOpen');
			} else {
				$('body').addClass('menuOpen');
			}
		}
		var $els = $('#header .more-sili, #toggleMobileMenu, #pushUpMenu .close, #mobileMenu .close');
		if ('ontouchstart' in document.documentElement) {
			$els.on('touchstart', handleToggle);
		} else {
			$els.on('click', handleToggle);
		}
	})();
	// handle header scroll
	$w.on('scroll resize', function(){
		if ($w.scrollTop() > 20) {
			$('body').addClass('scrolled');
		} else {
			$('body').removeClass('scrolled');
		}
	});
	// adjust wording on signup sticky footer
	(function($input){
		var ph = $input.prop('placeholder');
		$w.on('resize', function(){
			var ww = $w.width();
			if (ww < 980) {
				$input.prop('placeholder','Enter your email address.');
			} else {
				$input.prop('placeholder', ph);
			}
		}).trigger('resize');
	})($('#stickyFooter input'));
	// set copyright year
	$('#copyrightYear').text((new Date()).getFullYear());
	// set menu state
	(function(){
		var pathname = location.pathname;
		$('a[href]').each(function(){
			var $this = $(this), href = $this.attr('href');
			if (href === '/' || pathname === '/') {
				return;
			}
			if (pathname.indexOf(href) === 0) {
				$this.addClass('selected');
			}
		});
	})();
})($(window));