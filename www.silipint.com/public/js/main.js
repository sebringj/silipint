// enable popout menu
$(window).resize(function(){
	var iof = 'iosorientationfix';
	$('#mobileMenu .nav').css({
		height: 10000
	});
	if ($(window).data(iof)) {
		clearInterval($(window).data(iof));
	}
	$(window).data(iof, setTimeout(function(){
		var h = $(window).height();
		$('#mobileMenu .nav').css({
			height: h + 20
		});
	},10));
});
// handle menu toggle as quick as possible for mobile
(function(){ 
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
