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

$('.sub-nav .sub-nav-bar,.sub-nav .sub-list-view a.lv, .sub-nav a.close').on('click', function(ev){
	ev.preventDefault();
	var $this = $('.sub-nav');
	if ($this.hasClass('selected')) {
		$this.removeClass('selected');
		$this.find('.nav-items').slideUp('fast');
	} else {
		$this.addClass('selected');
		$this.find('.nav-items').slideDown('fast');
	}
});
if (location.pathname.indexOf('/sili-life') > -1) {
	$('.sub-nav .sub-list-view a.share-sili').show();
}

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
						
						$('#lightbox').find('iframe').each(function(){
							if ($(this).attr('src').indexOf('youtube') > -1) {
								$(this).removeAttr('width').removeAttr('height').css({
									width: '100%',
									height: '300px'
								});
							}
						});	
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

// config
hubsoft.clientid = 'silipint';
hubsoft.thumbNailImageIndex = 0;
hubsoft.detailImageIndex = 0;
hubsoft.global = { googleAnalytics: '' };
hubsoft.page = { messsages: {} };

hubsoft.cart.updateUI(function () {
    var cartCount = hubsoft.cart.itemCount();
    $('.cart-indicator span').text(cartCount);
});
hubsoft.cart.triggerUpdateUI();

hubsoft.handleLoginState = function () {

};
hubsoft.handleLoginState();

$('body').on('click','[data-add-to-cart]', function(){
	var $this = $(this);
	var sku = $this.data('sku');
	console.log(sku);
	var $container = $this.closest('[data-container]')
	var quantity = parseInt( $container.find('[data-quantifier]').val() );
	console.log(quantity);
	hubsoft.cart.snapshot();
	hubsoft.cart.set(sku,quantity);
	$container.find('[data-status]').css({opacity:0});
	hubsoft.ready(function(){
		hubsoft.validateCart(function(data){
			if (!data.success) {
				hubsoft.cart.undo();
				$container.find('[data-status]').text('out of stock').addClass('error');
			} else {
				$container.find('[data-status]').text('added to cart').removeClass('error');
			}
			$container.find('[data-status]').stop(true,true).animate({ opacity: 1},500)
			.delay(1500).animate({ opacity: 0},200);
		});
	});
});

window.silipint = window.silipint || {}; 
silipint.regexs = {
	email : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	twitter : /^@?([a-z0-9_]{1,15})$/i,
	phone : /(.*\d.*){10,}/
};
silipint.doForm = function(options, callback) {
	$(options.formSelector).submit(function(ev){
		if (options.preventDefault) { ev.preventDefault(); }
		var $form = $(this);
		var valid = true;
		$form.find('.alert').slideUp('fast');
		$form.find('input,textarea,select').removeClass('error').each(function(){
			var $this = $(this);
			var thisValid = true;
			var val = $.trim($this.val());
			var isRequired = ($this.filter('[required]').length === 1);
			var isBlank = (val === '');
			if (isRequired && isBlank) {
				valid = false;
				thisValid = false;
			} else if (!isBlank) {
				if ($this.attr('type') && $this.attr('type') === 'email') {
					if (!silipint.regexs.email.test(val)) {
						valid = false;
						thisValid = false;
					}
				}
				if ($this.attr('match')) {
					if (val !== $($this.attr('match')).val()) {
						valid = false;
						thisValid = false;
					}
				}
				if ($this.attr('pattern')) {
					if (!silipint.regexs[$this.attr('pattern')].test(val)) {
						valid = false;
						thisValid = false;
					}
				}			
			}
			if (!thisValid) {
				$this.addClass('error');
			}	
		});	
		if (!valid) {
			return $form.find('.alert').text(options.requiredErrorMessage).slideDown('fast');
		}
		$.post(options.url, $form.serialize(), function(json){
			if (json.err) {
				$form.find('.alert').text(options.serverErrorMessage).slideDown('fast');
				return callback({ err : options.serverErrorMessage });
			}
			$form.slideUp('fast');
			$(options.successSelector).text(options.successMessage).slideDown('fast');
			return callback({});
		}).fail(function(){
			$form.find('.alert').text(options.connectErrorMessage).slideDown('fast');
			return callback({ err : options.connectErrorMessage });
		});
	}).on('focus','input,textarea,select', function(ev){
		$(this).removeClass('error').closest('form').find('.alert').slideUp('fast');
	});
};
