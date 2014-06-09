silipint.doForm({
	preventDefault : true,
	formSelector : '.customer-service form',
	requiredErrorMessage : 'Please correct the form.',
	serverErrorMessage : 'An error occured while sending your form information. Please try again later.',
	connectErrorMessage : 'Silipint is not reachable with your internet connection.',
	successMessage : 'Thank you!',
	successSelector : '.customer-service .alert-success',
	url : '/customer-service'
},function(data){
	if (!data.err) {
		$('html,body').animate({ scrollTop: 0 }, 1000);
	}
});