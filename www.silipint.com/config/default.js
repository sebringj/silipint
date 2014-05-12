var kitguiAccountKey = '4aceedcf3de04167a836e1053d9f7f54';
module.exports = {
	domain : 'www.silipint.com',
	cdn : 'd1niwwqaddyuw4.cloudfront.net',
	kitgui : {
		host : 's3.amazonaws.com',
		basePath : '/kitgui/clients/' + kitguiAccountKey,
		accountKey : kitguiAccountKey
	},
	hubsoft : {
		clientid : 'silipint'
	},
	mailchimp : {
		apikey : 'aec1cb2fb245b91a097f611d03f2aee5-us4',
		url : 'https://us3.api.mailchimp.com/2.0/',
		listID : '1f4b1438dc'
	},
	email : {
        user: 'noreply@emeraldcode.com',
		to: 'info@silipint.com',	
        pass: 'Abc123!~!',
		from: 'noreply@emeraldcode.com'
	}
};