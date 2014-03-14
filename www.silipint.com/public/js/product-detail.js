console.log('product detail lightbox')
$('body').off('.lightbox').on('click.lightbox','.top-tabs a', function(ev){
	ev.preventDefault();
	$('.top-tabs a').removeClass('selected');
	$(this).addClass('selected');
	$('.tab-content').hide();
	$('.tab-content:eq('+ $(this).data('index') +')').show();
});