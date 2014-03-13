$('.top-tabs').on('click','a', function(ev){
	ev.preventDefault();
	$('.top-tabs a').removeClass('selected');
	$(this).addClass('selected');
	$('.tab-content').hide();
	$('.tab-content:eq('+ $(this).data('index') +')').show();
});