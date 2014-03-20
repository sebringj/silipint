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
		var stateBeforeLightBox = {
			path : location.pathname,
			title : document.title
		};
		var suppressStateChange = false;
		var scrollTopBeforeLightBox;
		var $el = null;
		var scriptsExecuted = {};
		var stylesLoaded = {};
		var methods = {
			openLightBox : function(options, cb) {
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
				if (!$('#lightbox:visible').length) {
					scrollTopBeforeLightBox = $(window).scrollTop();
				}
				$('body').addClass('lightboxed');
				$('#contentWrapper').scrollTop(scrollTopBeforeLightBox);
				$.get(options.path, function(html){
					function loadBody() {
						dependancyCount--;
						if (dependancyCount > 0) { return; }
						var cleanedBody = body
							.replace(/<script[^>]*>/gi,'<!--')
							.replace(/<\/script>/gi,'-->');
						var $div = $('<div>').html(cleanedBody);
						if (!options.animation) {
							$('#lightbox .lightbox-content')
								.find('[data-lightbox]').remove().end()
								.append($div.find('[data-lightbox]'));
							$('#lightbox').fadeIn('fast', function(){
								window.scrollTo(0,0);
							});							
						} else if (options.animation) {
							(function(){
								var $old = $('#lightbox .lightbox-content:first');
								var pos = $old.offset();
								var top = $old.position().top;
								var width = $old.outerWidth();
								var space = 500;
								var x1 = pos.left - width - space;
								var x2 = pos.left;
								var x3 = pos.left + width + space;
								var oldMoveX;
								var animationTime = 1000;
								var $newDiv = $('<div>').append(
									$('<div class="lightbox-content wrap-snap">')
										.append($('<div class="lightbox-close">'))
										.append($('<a class="lightbox-left lightbox-nav">'))
										.append($('<a class="lightbox-right lightbox-nav">'))
										.append($div.find('[data-lightbox]'))
								);
								$old.css({ position: 'absolute', left : x2, top: top, width: width });
								if (options.animation === 'left') {
									$newDiv.find('.lightbox-content').css({ position: 'absolute', left : x1, top: top, width: width });
									oldMoveX = x3;
								} else {
									$newDiv.find('.lightbox-content').css({ position: 'absolute', left: x3, top: top, width: width  });
									oldMoveX = x1;
								}
								$('#lightbox').append($newDiv.find('.lightbox-content'));
								var $new = $('#lightbox .lightbox-content:last');
								$new.animate({ left : x2 }, animationTime, 'swing', function(){
									$new.css({ left : 'auto', top: 'auto', position: 'relative', width: 'auto' });
								});
								$old.animate({ left : oldMoveX }, animationTime, 'swing', function(){
									$old.remove();
								});
							})();
						}
						if (cb) { cb(title, options.path); }
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
					}
					var style = html.match(/<link[^>]*data-lightbox[^>]*>/mi);
					if (style && style.length) {
						dependancyCount += style.length;
					}
					
					if (scripts && scripts.length) {
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
					
					if (style && style.length) {
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
			closeLightBox : function(callback) {
				if ($('#lightbox').length) {
					$('#lightbox').fadeOut('fast',function(){
						$('#lightbox').remove();
						$('body').removeClass('lightboxed');
						
						window.scrollTo(0,scrollTopBeforeLightBox);
					});
					$('#lightbox-back').fadeOut('fast', function(){
						$('#lightbox-back').remove();
					});
				}
				if ($.isFunction(callback)) {
					callback();
				}
			}
		};
		
		History.replaceState({ 
				method : 'closeLightBox', 
				path : location.path, 
				title : document.title 
			}, 
			document.title, 
			location.path
		);
		History.Adapter.bind(window, 'statechange', function(){
			var state = History.getState();
			if (!suppressStateChange && state) {
				/*if (state.data.animation) {
					switch (state.data.animation) {
						case 'left' : state.data.animation = 'right'; break;
						case 'right' : state.data..animation = 'left'; break;  
					}
				}*/
				methods[state.data.method](state.data);
			}
			suppressStateChange = false;
		});
					
		$('body').on('click','a[data-lightbox][href]', function(ev){
			ev.preventDefault();
			pathBeforeLightBox = document.location.path;
			$el = $(this);
			methods.openLightBox({
				path : $(this).attr('href')
			}, function(title, path){
				suppressStateChange = true;
				History.pushState({ method : 'openLightBox', path : path, title : title }, title, path);
			});
		}).on('click','#lightbox .lightbox-content', function(ev){
			ev.stopImmediatePropagation();
			ev.stopPropagation();
		}).on('click','#lightbox', function(){
			History.pushState({ method : 'closeLightBox', title : stateBeforeLightBox.title, path : stateBeforeLightBox.path }, 
			stateBeforeLightBox.title, stateBeforeLightBox.path);
		}).on('click', '#lightbox .lightbox-content .lightbox-close', function(){
			methods.closeLightBox(function(title, path){
				suppressStateChange = true;
				History.pushState({ method : 'closeLightBox', title : stateBeforeLightBox.title, path : stateBeforeLightBox.path }, 
				stateBeforeLightBox.title, stateBeforeLightBox.path);
				$el = null;
			});
		}).on('click', '#lightbox .lightbox-content .lightbox-nav', function(ev){
			ev.preventDefault();
			var newIndex = -1;
			var animation = 'left';
			if ($(this).hasClass('lightbox-right')) {
				newIndex = $el.index() + 1;
				if ($el.parent().find('[data-lightbox]:last').index() === newIndex) {
					return;
				}
				animation = 'right';
			} else {
				if ($el.index() === 0) {
					return;
				}
				newIndex = $el.index() - 1;
			}
			$el = $el.parent().find('[data-lightbox]:eq('+ newIndex +')');
			methods.openLightBox({
				path : $el.attr('href'),
				animation : animation
			}, function(title, path){
				suppressStateChange = true;
				if (animation === 'left') { animation = 'right'; } else { animation = 'left'; }
				History.pushState({ method : 'openLightBox', path : path, title : title }, title, path);
			});
		});
	})();
}
