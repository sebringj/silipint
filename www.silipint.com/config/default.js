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
		apikey : '[ FILL IN ]-us3',
		url : 'https://us3.api.mailchimp.com/2.0/',
		listID : '[ FILL IN ]'
	}
};