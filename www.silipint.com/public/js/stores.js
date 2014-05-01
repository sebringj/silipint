hubsoft.ready(function () {

	var latlng, map, geo, initialLocation, dataLocation,
        markersArray = [],
        circleOverlay = null,
        dealerResultCallback = null,
		map = new google.maps.Map($('.map')[0], {
		mapTypeControl: false,
		zoomControl: true,
		streetViewControl: false,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	map.setCenter(new google.maps.LatLng(33.063924, -95.449219));	
	
    if (window.localStorage && window.localStorage['location']) {
        map.setZoom(12);
        dataLocation = window.localStorage['location'].split(';');
        initialLocation = new google.maps.LatLng(dataLocation[0], dataLocation[1]);
        map.setCenter(initialLocation);
		
		setCircle(map, dataLocation[0], dataLocation[1]);
		
		hubsoft.getDealerLocations({
			lat : dataLocation[0],
			lng : dataLocation[1],
			radius : $('#within').val()
		}, handleDealerLocations);		

    } else if (navigator.geolocation) {
		
        navigator.geolocation.getCurrentPosition(function (position) {
            map.setZoom(12);
            if (window.localStorage) {
                window.localStorage['location'] = position.coords.latitude + ';' + position.coords.longitude;
            }
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
			
			setCircle(map, position.coords.latitude, position.coords.longitude);
			
			hubsoft.getDealerLocations({
				lat : position.coords.latitude,
				lng : position.coords.longitude,
				radius : $('#within').val()
			}, handleDealerLocations);
			
        }, function () {
              // error event
        });
    }	
	
	$('.stores form').submit(function(ev){
		ev.preventDefault();
		var geoCoder = new google.maps.Geocoder();
        geoCoder.geocode({ 'address': $('#address').val() }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
				
                map.setZoom(12);
                //map.setCenter(results[0].geometry.location);
				
				hubsoft.getDealerLocations({
					lat : results[0].geometry.location.lat(),
					lng : results[0].geometry.location.lng(),
					radius : $('#within').val()
				}, handleDealerLocations);
				
            }
        });
	});

	function handleDealerLocations(json) {
		console.log(json);
	}
	
    function setCircle(map, lat, lng) {
        var location = new google.maps.LatLng(lat, lng);
        var radiusCircle = {
            strokeColor: "#C5C8CD",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#C5C8CD",
            fillOpacity: 0.25,
            map: map,
            radius: 1609.344 * $('#radius option:selected').text(), //miles to meters
            center: location
        };
        circleOverlay = new google.maps.Circle(radiusCircle);
    }

});