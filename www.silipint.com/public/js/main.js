// enable popout menu
$(window).resize(function(){
	$('#mobileMenu .nav').css({
		height: 10000
	});
	if ($(window).data('iosorientationfix')) {
		clearInterval($(window).data('iosorientationfix'));
	}
	$(window).data('iosorientationfix', setTimeout(function(){
		var h = $(window).height();
		$('#mobileMenu .nav').css({
			height: h + 20
		});
	},10));
});
$('#header .more-sili, #toggleMobileMenu, #pushUpMenu .close, #mobileMenu .close').click(function(ev){
	ev.preventDefault();
	console.log('toggle');
	if ($('body').hasClass('menuOpen')) {
		$('body').removeClass('menuOpen');
	} else {
		$('body').addClass('menuOpen');
	}
});
