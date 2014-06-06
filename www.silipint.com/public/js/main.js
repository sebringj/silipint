this.app = {};
if ('ontouchstart' in document.documentElement) {
	app.quickClick = 'touchstart';
} else {
	app.quickClick = 'click';
}
(function(){
	var securePath = {'/cart':1,'/checkout':1,'/create-account':1,'/sign-in':1,'/forgot-password':1,'/account':1};
	var secureHostName = {'www.silipint.com':1,'dev.silipint.com':1};
	function checkPath(protocol, hostname, pathname) {
		if (secureHostName[hostname] && securePath[pathname] && protocol === 'http:') {
			document.location = 'https://' + hostname + pathname;
		} else if (protocol === 'https:' && !securePath[pathname]) {
			document.location = 'http://' + hostname + pathname;
		}
	}
	checkPath(location.protocol, location.hostname, location.pathname);
	
	function handleHref(href) {
		if (href.indexOf('http') === 0 || !secureHostName[location.hostname]) {
			return { interupt : false, href : href };
		} else if (location.protocol === 'http:' && securePath[href]) {
			return { interupt : true, href : 'https://' + location.hostname + href };
		} else if (location.protocol === 'https:' && !securePath[href]) {
			return { interupt: true, href : 'http://' + location.hostname + href };
		}
		return { interupt : false, href : href };
	}
	
	app.scriptRedirect = function(href) {
		var obj = handleHref(href);
		location = obj.href;
	};
	
	if (location.hostname !== 'localhost') {
		$('a[href]').on('click', function(ev){
			var obj = handleHref($(this).attr('href'));
			if ( obj.interupt ) {
				ev.preventDefault();
				location = obj.href;
			}
		});		
	}
})();
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
		$els.on(app.quickClick, handleToggle);
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
} else if (location.pathname.indexOf('/customize') > -1) {
	$('.sub-nav .sub-list-view a.customer-service').show();
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
		var lastHref = '';
		var scriptsExecuted = {};
		var stylesLoaded = {};
		var blockClick = false;
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
						console.log(scripts.length);
						$.each(scripts, function(i,v){
							var src = /src="([^"]+)"/i.exec(v);
							if (scriptsExecuted[src[1]]) { loadBody(); return; }
							if (src && src.length === 2) {
								$.getScript(src[1], function(){
									console.log('script executed');
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
			if (blockClick) { return; }
			if (/^https?:\/\//.test($(this).attr('href'))) { 
				$(this).attr('target','_blank');
				return true;
			}
			
			ev.preventDefault();
			pathBeforeLightBox = document.location.path;
			$el = $(this);
			lastHref = $(this).attr('href');
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
			if (blockClick) { return; }			
			blockClick = true;
			var newIndex = -1;
			var animation = 'left';
			var index, i;
			if (hubsoft.productURLs) {
				console.log(lastHref);
				for(i = 0; i < hubsoft.productURLs.length; i++) {
					if (hubsoft.productURLs[i] === lastHref) {
						index = i;
						break;
					}
				}
				if ($(this).hasClass('lightbox-right')) {
					if (index+1 === hubsoft.productURLs.length) {
						index = 0;
					} else {
						index++;
					}
					animation = 'right';
				} else {
					if (index-1 < 0) {
						index = hubsoft.productURLs.length - 1;
					} else {
						index--;
					}
				}
				lastHref = hubsoft.productURLs[index];
				console.log(lastHref);
			} else {
				if ($(this).hasClass('lightbox-right')) {
					newIndex = $el.index() + 1;
					if ($el.parent().find('[data-lightbox]:last').index() <= newIndex) {
						newIndex = 0;
					}
					animation = 'right';
				} else {
					if ($el.index() === 0) {
						newIndex = ($el.parent().find('[data-lightbox]:last').index());				
					} else {
						newIndex = $el.index() - 1;
					}
				}
				$el = $el.parent().find('[data-lightbox]:eq('+ newIndex +')');
				lastHref = $el.attr('href');
			}
			methods.openLightBox({
				path : lastHref,
				animation : animation
			}, function(title, path){
				suppressStateChange = true;
				if (animation === 'left') { animation = 'right'; } else { animation = 'left'; }
				History.pushState({ method : 'openLightBox', path : path, title : title }, title, path);
				blockClick = false;
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
	console.log('sku: ' + sku);
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
}).on(app.quickClick,'#mobileMenu .header .state',function(ev) {
	console.log('mobileMenu header state click');
	var $this = $(this), $header = $this.closest('.header'), $a = $header.find('a');
	if ($header.hasClass('opn')) {
		$header.removeClass('opn');
		$('.sub-row' + $a.data('subnavs') ).stop(true,true).slideUp('fast');
	} else {
		$header.addClass('opn');
		$('.sub-row' + $a.data('subnavs') ).stop(true,true).slideDown('fast');
	}
});

window.silipint = window.silipint || {}; 
silipint.regexs = {
	email : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	twitter : /^@?([a-z0-9_]{1,15})$/i,
	phone : /(.*\d.*){10,}/
};
silipint.doForm = function(options, callback) {
	var blockForm = false;
	console.log(options.formSelector)
	$(options.formSelector).submit(function(ev){
		if (options.preventDefault) { ev.preventDefault(); }
		if (blockForm) { return; }
		blockForm = true;
		var $form = $(this);
		var valid = true;
		$form.find('.alert').slideUp('fast');
		$form.find('button[type=submit]').prop('disabled',true);
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
			blockForm = false;
			$form.find('button[type=submit]').prop('disabled',false);
			return $form.find('.alert.alert-danger').text(options.requiredErrorMessage).slideDown('fast');
		}
		$form.find('.alert.alert-warning').slideDown('fast');
		$.post(options.url, $form.serialize(), function(json){
			$form.find('.alert.alert-warning').slideUp('fast');
			if (json.err) {
				blockForm = false;
				$form.find('.alert.alert-danger').text(options.serverErrorMessage).slideDown('fast');
				return callback({ err : options.serverErrorMessage });
			}
			$form.slideUp('fast');
			$(options.successSelector).text(options.successMessage).slideDown('fast');
			return callback({});
		}).fail(function(){
			$form.find('.alert.alert-warning').slideUp('fast');
			blockForm = false;
			$form.find('button[type=submit]').prop('disabled',false);
			$form.find('.alert.alert-danger').text(options.connectErrorMessage).slideDown('fast');
			return callback({ err : options.connectErrorMessage });
		});
	}).on('focus','input,textarea,select', function(ev){
		$(this).removeClass('error').closest('form').find('.alert').slideUp('fast');
	});
};

(function(){ // subscribe
	$('body').on('submit','form[data-subscribe]', function(ev) {
		ev.preventDefault();
		var $this = $(this);
		var email = $(this).find('input[name=email]').val();
		
		if (!silipint.regexs.email.test(email)) { return; }
		$.post('/subscribe',{ email : email }, function(json){
			$('#subscriptionConfirm').modal('show');
			$this.find('[name=email]').val('');
		},'json');
		$('#subscriptionConfirm').modal('show');
	});
})();