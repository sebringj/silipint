silipint.doForm({
	preventDefault : true,
	formSelector : '.share-sili form',
	requiredErrorMessage : 'Please correct the form.',
	serverErrorMessage : 'An error occured while sending your form information. Please try again later.',
	connectErrorMessage : 'Silipint is not reachable with your internet connection.',
	successMessage : 'Thank you for input!',
	successSelector : '.share-sili .alert-success',
	url : '/share-sili'
},function(){
	$('html,body').animate({ scrollTop: 0 }, 1000);
});