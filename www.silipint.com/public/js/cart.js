(function () {
    function updateCart() {
        hubsoft.getCartProducts(function (data) {
            var i, len, html, item;
            data.subtotal = 0;
			
            if (data.items && data.items.length) {
                for (i = 0, len = data.items.length; i < len; i++) {
                    item = data.items[i];
					if (item) { data.subtotal += (item.unitPrice * item.quantity); }
					else { data.items.splice(i,1); }
                }
                html = silipint.nunjucks.render('partials/cart.html',data);
                $('#cartList').html(html);
            }
            if (data.items == null || hubsoft.cart.items.length === 0) {
				//if (!data.success) { hubsoft.cart.clearCookie(); }
                $('#cartList').html(silipint.nunjucks.render('partials/cart.html',{ items: [] }));
                $('#cart').fadeOut('fast', function () {
                    $('#no-items').fadeIn('fast');
                });
            } else {
            	$('#cart').show();
            }
        });
    }

    hubsoft.ready(function () {
        updateCart();
        hubsoft.validateCart(function (data) {
			
        });
    });

    $('body').on('click', '#cart button.btn-close', function (ev) {
        var $tr = $(this).closest('tr'), sku = $tr.data('sku');
        hubsoft.cart.remove(sku);
        $tr.fadeOut('fast', function () {
            $tr.remove();
            updateCart();
        });
    }).on('keypress', '#cart input.qty', function (ev) {
        if (ev.which !== 0 && ev.which !== 8 && (ev.which < 48 || ev.which > 57)) {
            return false;
        }
    }).on('keyup', '#cart input.qty', function (ev) {
        var val, sku = $(this).closest('tr').data('sku');
        if (ev.which >= 48 && ev.which <= 57) {
            val = parseInt($(this).val());
            if (val === 0) {
                hubsoft.cart.remove(sku);
            } else {
                hubsoft.cart.snapshot();
                hubsoft.cart.set(sku, val);
                hubsoft.validateCart(function (data) {
					var message;
                    if (!data.success && data.errors && data.errors.length) {
						if (data.errors[0].message) {
							if(data.errors[0].message.indexOf(':') > -1) {
								message = data.errors[0].message.split(':')[1];
							} else {
								message = data.errors[0].message;
							}
							console.log(message);
							return $('#cartModal').find('.alert').text(message).show().end().modal('show');
						}
                    }
                });
            }
            updateCart();
        }
    }).on('blur', '#cart input.qty', function (ev) {
        updateCart();
    }).on('submit', '.coupon-form', function(ev) {
		ev.preventDefault();
		var $form = $(this);
		var $input = $form.find('input');
		$input.removeClass('error');
		if ($.trim($input.val()) === '') {
			return $input.addClass('error');
		}
    	hubsoft.setCoupon({
			coupon : $input.val()
    		}, function(data) {
    			if (data.success) {
    				$('#couponModal').find('.modal-body ').removeClass('error')
					.text('Your coupon was applied for ' + data.percentOff + '% off!')
					.end().modal('show');
					$input.val('');
					updateCart();
    			} else {
    				$('#couponModal').find('.modal-body p').addClass('error')
					.text(data.message).end().modal('show');
    			}
    		}
		);
    }).on('focus', '.coupon-form input', function() {
    	$(this).removeClass('error');
    });
})();