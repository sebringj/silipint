module.exports = [
	{ path : '/', method : 'home' },
	{ path : /-lb$/, method : 'lightbox' },
	{ path : /-lb2$/, method : 'lightbox2' },
	{ path : /\.htm$/, method : 'content' },
	{ path : '/customer-service', method : 'customerService' },
	{ path : '/customer-service', method : 'postCustomerService', verb : 'post' },
	{ path : '/share-sili', method : 'shareSili' },
	{ path : '/share-sili', method : 'postSiliShare', verb : 'post' },
	{ path : '/about-silipint', method : 'landing' },
	{ path : '/about-silicone', method : 'landing' },
	{ path : '/account', method : 'account' },
	{ path : '/sign-in', method : 'signin' },
	{ path : '/sign-out', method : 'signout' },
	{ path : '/forgot-password', method : 'forgotPassword' },
	{ path : '/subscribe', method : 'subscribe', verb : 'post' },
	//{ path : '/american-flag-drinking-glasses-16oz', method : 'collection' },
	{ path : '/artist-series', method : 'collection' },
	//{ path : '/bamboo-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/bend-oregon-drinking-cup-8oz', method : 'collection' },
	//{ path : '/bend-oregon-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/bend-oregon-shot-glasses-1.5oz', method : 'collection' },
	//{ path : '/bike-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/bike-glasses-16oz', method : 'collection' },
	{ path : '/cart', method : 'cart' },
	{ path : '/checkout', method : 'checkout' },
	{ path : '/colored-drinking-glasses', method : 'collection' },
	//{ path : '/colorful-shot-glasses-1.5oz', method : 'collection' },
	{ path : '/contact-us', method : 'contactus' },
	//{ path : '/cups-for-kids-8oz', method : 'collection' },
	{ path : '/customize', method : 'landing' },
	{ path : '/customize/:page', method : 'listing' },
	//{ path : '/desert-wonders-drinking-cup-8oz', method : 'collection' },
	//{ path : '/desert-wonders-drinking-cup-9oz', method : 'collection' },
	//{ path : '/desert-wonders-shot-glasses-1.5oz', method : 'collection' },
	//{ path : '/drinking-games-pint-glasses-16oz', method : 'collection' },
	//{ path : '/drinks-up-tees-down-golf-shot-glasses-1.5oz', method : 'collection' },
	{ path : '/faq', method : 'faq' },
	{ path : '/find-a-retailer', method : 'findaretailer' },
	//{ path : '/football-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/frosted-drinking-cup-9oz', method : 'collection' },
	//{ path : '/frosted-drinking-cup-8oz', method : 'collection' },
	//{ path : '/frosted-pint-glasses-16oz', method : 'collection' },
	//{ path : '/frosted-shot-glass-1.5oz', method : 'collection' },
	{ path : '/gift-cards', method : 'collection' },
	//{ path : '/grass-flower-drinking-glass-16oz', method : 'collection' },
	//{ path : '/green-earth-drinking-glasses-16oz', method : 'collection' },
	{ path : '/half-pint-glasses', method : 'collection' },
	//{ path : '/happy-camper-drinking-cup-9oz', method : 'collection' },
	//{ path : '/happy-camper-drinking-cup-8oz', method : 'collection' },
	//{ path : '/how-now-mr-pow-drinking-cup-9oz', method : 'collection' },
	//{ path : '/i-love-beer-pint-glasses-16oz', method : 'collection' },
	{ path : '/lids', method : 'collection' },
	//{ path : '/lime-time-shot-glasses-1.5oz', method : 'collection' },
	//{ path : '/maple-leaf-shot-glasses-1.5oz', method : 'collection' },
	//{ path : '/maple-tree-drinking-cup-8oz', method : 'collection' },
	//{ path : '/maple-tree-drinking-cup-9oz', method : 'collection' },
	//{ path : '/mustache-drinking-glasses-16oz', method : 'collection' },
	{ path : '/new-silipint-products', method : 'collection' },
	//{ path : '/old-mill-district-drinking-glasses-16oz', method : 'collection' },
	{ path : '/personalize-a-pint-glass', method : 'content' },
	//{ path : '/pine-tree-drinking-glasses-16oz', method : 'collection' },
	{ path : '/pint-glasses', method : 'collection' },
	//{ path : '/pint-glass-lid-16oz-pint', method : 'collection' },
	//{ path : '/purple-air-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/red-fire-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/reduce-reuse-rehydrate-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/ru-on-on-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/rv-camper-drinking-glasses-16oz', method : 'collection' },
	{ path : '/sale', method : 'collection' },
	{ path : '/sales', method : 'collection' },
	{ path : '/sell-silipint', method : 'content' },
	//{ path : '/shamrock-drinking-glasses-16oz', method : 'collection' },
	{ path : '/shop-sillipint-drinking-glasses', method : 'shop' },
	{ path : '/shorty-cups', method : 'collection' },
	{ path : '/shot-glasses', method : 'collection' },
	//{ path : '/sili-face-shot-glasses-1.5oz', method : 'collection' },
	{ path : '/sili-life', method : 'landing' },
	{ path : '/sili-life/:page', method : 'listing' },
	{ path : '/sili-life/artists-series', method : 'collection' },
	{ path : '/sili-life/news', method : 'collection' },
	{ path : '/sili-life/videos', method : 'collection' },
	{ path : '/silipint-sets', method : 'collection' },
	//{ path : '/snowman-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/state-of-oregon-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/state-of-texas-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/state-of-texas-drinking-glasses-16oz', method : 'collection' },
	//{ path : '/sunflower-drinking-glass-16oz', method : 'collection' },
	//{ path : '/sunglass-drinking-glass-16oz', method : 'collection' },
	{ path : '/wine-bottle-stopper', method : 'collection' },
	//{ path : '/world-map-drinking-glasses-16oz', method : 'collection' },
	{ path : '/refresh', method : 'refresh' },
	{ path : /(oz|-detail)$/, method : 'detail' },
];
