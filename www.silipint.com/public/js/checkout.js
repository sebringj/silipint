(function () {
    hubsoft.tax = 0;
    hubsoft.shipping = 0;
    hubsoft.shippingDataExists = false;

    $('input[name="same-contact"],input[name="same-address"]').change(function () {
        var $this = $(this),
            checked = $this.prop('checked'),
            $div = $('.' + $this.attr('name'));
        if (checked) {
            $div.hide();
        } else {
            $div.show();
        }
    });
    var states = $('#us-states').html();
    $('select[name="shipping-state"]').html(states);
    $('select[name="payment-state"]').html(states);

    $('.country').change(function () {
        var $country = $(this),
            name = $country.attr('name'),
            prefix = name.split('-')[0],
            displayfor;
        console.log($country.val());
        $state = $country.closest('fieldset').find('.state');
        if ($country.val() === 'US') {
            $state.replaceWith($('#us-states').html());
        } else if ($country.val() === 'CA') {
            $state.replaceWith($('#canada-states').html());
        } else {
            $state.replaceWith($('#international-states').html());
        }
        $country.closest('fieldset').find('.state').attr('name', prefix + '-state');

        if ($country.val() === 'US') {
            $country.closest('fieldset').find('.zipcode').attr('placeholder', 'zipcode');
        } else {
            $country.closest('fieldset').find('.zipcode').attr('placeholder', 'postalcode');
        }

        if (name === 'shipping-country' && hubsoft.shippingDataExists) {
            $('[name=shipping-method]').html(hubsoft.shippingOptions);
            displayfor = $country.find('option:selected').data('displayfor');
			if (!displayfor) { return; }
            $('[name=shipping-method] option').each(function () {
                var $option = $(this), df = $option.data('displayfor');
                if (!df) { return; }
                if (displayfor.indexOf(df) === -1) {
                    $option.remove();
                }
            });
        }

    }).trigger('change');

    $('form.checkout').submit(function (ev) {
        ev.preventDefault();
    });

    function validate() {
        var $this = $(this),
            val = $.trim($this.val()),
            isBlank = false,
            required = ($this.filter('[required]').length === 1);
		
        if (required && val === '') {
            $this.addClass('error');
            $('form.checkout').data('error', true);
            isBlank = true;
        } else {
            $this.removeClass('error');
        }

        // don't do validation checks if its not required and its blank
        if (!required && isBlank) { return; }

        // otherwise we validate
        switch($this.attr('type')) {
            case 'email' :
                if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(val)) {
                    $this.removeClass('error');
                } else {
                    $this.addClass('error');
                }
                break;
            case 'tel' :
                if (typeof val === 'string' && val.match(/[\d]/g) && val.match(/[\d]/g).length >= 10) {
                    $this.removeClass('error');
                } else {
                    $this.addClass('error');
                }
                break;
        }
        // validate custom types
        if ($this.data('type')) {
            switch ($this.data('type')) {
                case 'credit-card':
                    if (val) {
                        (function () {
                            var l = val.match(/[\d]/g).length,
                                error = false;
                            if (l >= 15 && l <= 16) {
                                // todo: do more validation on number pattern for card type
                            } else {
                                error = true;
                            }
                            if (error) {
                                $this.addClass('error');
                            } else {
                                $this.removeClass('error');
                            }
                        })();
                    } else {
                        $this.addClass('error');
                    }
                    break;
                case 'integer':
                    if (val && /^[\d]{3,4}$/.test(val)) {
                        $this.removeClass('error');
                    } else {
                        $this.addClass('error');
                    }
                    break;
            }
        }
    }
	
	$('[name=shipping-method]').change(function(){
		$('#shippingMessage').slideUp('fast');
		$('form.checkout').trigger('click');
		if ($(this).get(0).selectedIndex < 1) { return; }
		hubsoft.validateCart({
			shippingCode : $('[name=shipping-method]').val()
		},function(data){
			console.log(data);
			if (data.message) {
				$('#shippingMessage').text(data.message).slideDown('fast');
			}
		});		
	});

    $('form.checkout').on('click blur change keypress', 'input:visible,select:visible', function () {
        validate.apply(this);
        $('.alert-danger').slideUp('fast');
    });

    $('.checkout-btn').click(function () {
        console.log('form submit');
        $('form.checkout').data('error', false);
        $('form.checkout').find('input:visible,select:visible').each(function () {
            validate.apply(this);
        });

        var isError = $('form.checkout').data('error');
        if (isError) {
            $('.alert-danger.form-error').slideDown('fast');
            return;
        }

        var s = hubsoft.shippingData,
            si = s.shippingInfo;

        var sameContact = ($('[name="same-contact"]').is(':checked')),
            sameAddress = ($('[name="same-address"]').is(':checked'));

        console.log({
            sameContact: sameContact,
            sameAddress : sameAddress,
            shipping: s
        });

        var inputs = {
            orderNumber: s.orderNumber,
            shippingAddress: si.street + ((si.street2) ? ' ' + si.street2 : ''),
            shippingCity: si.city,
            shippingState: si.stateCode,
            shippingPostalCode: si.postalCode,
            shippingCountry: si.countryCode,
            additionalInfo: '',
            cardNumber: $('[name="payment-number"]').val().replace(/[^\d]/gi, ''),
            cardType: $('[name="payment-cardtype"]').val(),
            securityCode: $('[name="security-code"]').val(),
            month: $('[name="month"]').val(),
            year: $('[name="year"]').val(),
            firstName: (sameContact) ? $('[name="shipping-firstname"]').val() : $('[name="payment-firstname"]').val(),
            lastName: (sameContact) ? $('[name="shipping-lastname"]').val() : $('[name="payment-lastname"]').val(),
            phone: (sameContact) ? $('[name="shipping-phone"]').val() : $('[name="payment-phone"]').val(),
            email: (sameContact) ? si.email : $('[name="payment-email"]').val(),
            address: (sameAddress) ? si.street : $('[name="payment-address"]').val(),
            address2: (sameAddress) ? ((si.street2) ? ' ' + si.street2 : '') : $('[name="payment-address2"]').val(),
            city: (sameAddress) ? si.city : $('[name="payment-city"]').val(),
            state: (sameAddress) ? si.stateCode : $('[name="payment-state"]').val(),
            country: (sameAddress) ? si.countryCode : $('[name="payment-country"]').val(),
            postalCode: (sameAddress) ? si.postalCode : $('[name="payment-zipcode"]').val()
        };

        hubsoft.transact(inputs, function (data) {
            var html = '',
                paymentNumber = inputs.cardNumber,
                orderReceiptData = {
                    orderNumber: inputs.orderNumber,
                    shippingFirstName: $('[name="shipping-firstname"]').val(),
                    shippingLastName: $('[name="shipping-lastname"]').val(),
                    shippingEmail: si.email,
                    shippingPhone: $('[name="shipping-phone"]').val(),
                    shippingAddress1: si.street,
                    shippingAddress2: ((si.street2) ? ' ' + si.street2 : ''),
                    shippingCity: inputs.shippingCity,
                    shippingState: inputs.shippingState,
                    shippingPostalCode: inputs.shippingPostalCode,
                    shippingCountry: inputs.shippingCountry,
                    shippingType: $('[name="shipping-method"] option:selected').text(),
                    paymentFirstName: inputs.firstName,
                    paymentLastName: inputs.lastName,
                    paymentEmail: inputs.email,
                    paymentPhone: inputs.phone,
                    paymentAddress1: inputs.address,
                    paymentAddress2: inputs.address2,
                    paymentCity: inputs.city,
                    paymentState: inputs.state,
                    paymentCountry: inputs.country,
                    paymentPostalCode: inputs.postalCode,
                    cardType: $('[name="payment-cardtype"] option:selected').text(),
                    last4: paymentNumber.substr(paymentNumber.length - 4),
                    month: inputs.month,
                    year: inputs.year
                };

            if (data.success) {
                html = silipint.nunjucks.render('partials/order-receipt.html',orderReceiptData);
                $('h1').hide();
                $('.order-receipt-container').html(html);
                $('.order-items').html($('.order-review').html());
                $('.checkout-page form, .checkout-page .order-review-container').hide();
                $('.order-receipt-container').show();
                $('body,html').scrollTop(0);
				
			    hubsoft.getCartProducts(function (data) {
					if (!data.items || !data.items.length) { return; }
					
			        var i, html, item;
			        data.subtotal = 0;
			        data.total = 0;
								        
					var cartItems = [];
		            for (i = 0; i < data.items.length; i++) {
		                item = data.items[i];
						cartItems.push([
							'_addItem',
							orderReceiptData.orderNumber,
							item.sku,
							item.productName,
							'',
							item.unitPrice,
							item.quantity
						]);
		                data.subtotal += (item.unitPrice * item.quantity);
		            }
		            data.total = data.subtotal + hubsoft.tax + hubsoft.shipping;
					data.tax = hubsoft.tax;
					data.shipping = hubsoft.shipping;
					
					window._gaq = window._gaq || [];
					
					_gaq.push(['_setAccount', 'UA-21660623-1']);
					_gaq.push(['_trackPageview']);
					_gaq.push(['_addTrans',
						orderReceiptData.orderNumber,
						'Silipint',
						data.total,
						data.tax,
						data.shipping,
						orderReceiptData.paymentCity,
						orderReceiptData.paymentState,
						orderReceiptData.paymentCountry 
					]);	
					
					for (i = 0; i < cartItems.length; i++) {
						_gaq.push(cartItems[i]);
					}
					
					_gaq.push(['_trackTrans']);
					$.getScript('https://ssl.google-analytics.com/ga.js');
					
					hubsoft.cart.clearCookie();
			    });
            } else {
                $('.alert-danger.payment-error').slideDown('fast');
            }
        });
    });

})();

hubsoft.doReviewOrder = function () {
    hubsoft.getCartProducts(function (data) {
        var i, len, html, item;
        data.subtotal = 0;
        data.total = 0;
        if (data.items != null && data.items.length > 0) {
            for (i = 0, len = data.items.length; i < len; i++) {
                item = data.items[i];
                data.subtotal += (item.unitPrice * item.quantity);
            }
            data.total = data.subtotal + hubsoft.tax + hubsoft.shipping;
			data.tax = hubsoft.tax;
			data.shipping = hubsoft.shipping;
			html = silipint.nunjucks.render('partials/order-review.html', data);
            $('.order-review').html(html);
        } else {
            location = '/cart';
        }
    });
};

hubsoft.ready(function () {
    hubsoft.getPaymentOptions(function (data) {
        var $cardType = $('[name="payment-cardtype"]'),
            paymentType;
        for (var i = 0; i < data.paymentOptions.length; i++) {
            paymentType = data.paymentOptions[i];
            $cardType.append($('<option>').val(paymentType.paymentCode).text(paymentType.paymentDescription));
        }
    });

    hubsoft.doReviewOrder();

    hubsoft.getShippingOptions(function (data) {
        var $shipping = $('select[name="shipping-method"]'),
            option,
            $select = $('<select>');
        for (var i = 0; i < data.shippingOptions.length; i++) {
            option = data.shippingOptions[i];
            $select.append($('<option>').val(option.shippingCode)
                .attr('data-displayfor', option.displayFor).text(option.shippingDescription));
        }
        $shipping.append($select.html());
        hubsoft.shippingOptions = $shipping.html();
        hubsoft.shippingDataExists = true;
    });

    var checkingShipping = false;
    function checkIfShippingReady() {
        var shippingReady = true;
        $('.shipping-group').find('input,select').each(function () {
            var $this = $(this),
                val = $.trim($this.val());
                required = ($this.filter('[required]').length === 1);
            if (required && val === '') {
                shippingReady = false;
                return;
            }
        });
        if (!shippingReady || checkingShipping) { console.log('shipping not ready'); return; }
        checkingShipping = true;

		console.log('auth shipping')
        hubsoft.authShipping({
            firstName: $('[name=shipping-firstname]').val(),
            lastName: $('[name=shipping-lastname]').val(),
            email: $('[name=shipping-email]').val(),
            phone : $('[name=shipping-phone]').val(),
            address: $('[name=shipping-address]').val(),
            address2: $('[name=shipping-address2]').val(),
            city: $('[name=shipping-city]').val(),
            state: $('[name=shipping-state]').val(),
            postalCode: $('[name=shipping-zipcode]').val(),
            country: $('[name=shipping-country]').val(),
            note: '',
            shippingMethod: $('[name=shipping-method]').val(),
            additionalInfo:($('[name=additional-info]').filter(':checked').length === 1),
        }, function (data) {
			var message;
			if (!data.success) {
				if (data.message) {
					if(data.message.indexOf(':') > -1) {
						message = data.message.split(':')[1];
					} else {
						message = data.message;
					}
				}
				console.log(message);
				return $('#checkoutModal').find('.alert').text(message).show().end().modal('show');
			}
            checkingShipping = false;
            hubsoft.shippingData = data;
            hubsoft.tax = data.taxAmount;
            hubsoft.shipping = data.shippingAmount;
            hubsoft.doReviewOrder();
			console.log(data);
        });
    }
	
	$('#checkoutModal').on('hide.bs.modal',function(){
		app.scriptRedirect('/cart');
	});

    $('.shipping-group').on('blur focus change', 'input,select', checkIfShippingReady);
});