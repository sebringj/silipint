var config = require('config'),
nodemailer = require('nodemailer'),
path = require('path'),
emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function getSmtpTransport() {
	var nodemailer = require('nodemailer');
	return nodemailer.createTransport('SMTP', {
	    service : 'Gmail',
	    auth: {
	        user: config.email.user,
	        pass: config.email.pass
	    }
	});
}
function sendEmail(options, callback) {
	var smtpTransport = getSmtpTransport();
	
	// send mail with defined transport object
	smtpTransport.sendMail(options, function(error, response){
		if (!options.subject || options.html) {
			callback({
				success : false,
				message : 'subject and html are required'
			});
			return;		
		}
		if (callback) { 
		    if(error) {
		        callback({
					err : 'error',
					error : error,
					response : response
				});
		    } else {
				callback({
					success : true,
					message : 'ok'
				});
		    }
		}
		smtpTransport.close();
	});
};

module.exports.send = sendEmail;
module.exports.isEmail = function(str) {
	return emailRE.test(str);
}