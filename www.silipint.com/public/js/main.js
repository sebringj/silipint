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

$('.shop-nav-bar').on('click', function(ev){
	ev.preventDefault();
	var $this = $('.shop-nav');
	if ($this.hasClass('selected')) {
		$this.removeClass('selected');
		$this.find('.nav-items').slideUp('fast');
	} else {
		$this.addClass('selected');
		$this.find('.nav-items').slideDown('fast');
	}
});

// lightbox
if (history.pushState) {
	(function(){
		var scriptsExecuted = {};
		var stylesLoaded = {};
		var methods = {
			openLightBox : function(options) {
				if (!$('#lightbox').length) {
					$('body')
					.append($('<div id="lightbox-back">'))
					.append(
						$('<div id="lightbox" style="display:none">')
							.append(
								$('<div class="lightbox-content wrap-snap">')
									.append($('<div class="lightbox-close">'))
									.append($('<a class="lightbox-left lightbox-nav">'))
									.append($('<a class="lightbox-right lightbox-nav">'))
							)
					);
				}
				$('#contentWrapper').addClass('lightboxed').scrollTop($(window).scrollTop());
				$.get(options.path, function(html){
					function loadBody() {
						dependancyCount--;
						if (dependancyCount > 0) { return; }
						var cleanedBody = body
							.replace(/<script[^>]*>/gi,'<!--')
							.replace(/<\/script>/gi,'-->');
						var $div = $('<div>').html(cleanedBody);
						$('#lightbox .lightbox-content').append($div.find('[data-lightbox]'));
						$('#lightbox').fadeIn('fast');
						window.scrollTo(0,0);
					}
					var dependancyCount = 0;
					var title = (/(?:<title[^>]*>)([^<]*)(?:<\/title>)/i).exec(html);
					if (title && title.length === 2) {
						title = title[1];
					} else { title = ''; }
					var body = /(?:<body[^>]*>)([\s\S]*)(?:<\/body>)/mi.exec(html);
					if (body && body.length === 2) {
						body = body[1];
					} else { body = ''; }
					var scripts = html.match(/<script[^>]*data-lightbox[^>]*><\/script>/mi);
					if (scripts && scripts.length) {
						dependancyCount += scripts.length;
						$.each(scripts, function(i,v){
							var src = /src="([^"]+)"/i.exec(v);
							if (scriptsExecuted[src[1]]) { loadBody(); return; }
							if (src && src.length === 2) {
								$.getScript(src[1], function(){
									scriptsExecuted[src[1]] = 1;
									loadBody(); 
								});
							}
						});
					}
					var style = html.match(/<link[^>]*data-lightbox[^>]*>/mi);
					if (style && style.length) {
						dependancyCount += style.length;
						$.each(style, function(i,v){
							var href = /href="([^"]+)"/i.exec(v);
							if (stylesLoaded[href[1]]) { loadBody(); return; }
							if (href && href.length === 2) {
								$.get(href[1], function(text){
									$('head').append($('<style>').html(text));
									stylesLoaded[href[1]] = 1;
									loadBody(); 
								},'text');
							}
						});
					}
				}, 'text');
			},
			closeLightBox : function() {
				if ($('#lightbox').length) {
					$('#lightbox').fadeOut('fast',function(){
						$('#lightbox').remove();
						$('#contentWrapper').removeClass('lightboxed');
					});
					$('#lightbox-back').fadeOut('fast', function(){
						$('#lightbox-back').remove();
					})
				}
			}
		};
		
		console.log(navigator.userAgent);
		
		$(window).on('popstate', function(ev){
			/*console.log('popstate');
			if (ev.state && ev.state.method) {
				ev.state.options.popstate = true;
				methods[ev.state.method](ev.state.options);
			}*/
		});
		//history.replaceState({}, document.title, location.path);
		
		$('body').on('click','a[data-lightbox][href]', function(ev){
			ev.preventDefault();
			methods.openLightBox({
				path : $(this).attr('href')
			});
		});
	})();
}
