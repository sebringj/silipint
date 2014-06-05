hubsoft.ready(function () {

	var latlng, map, markers = [], locList = [], circleOverlay = null,
		map = new google.maps.Map($('.map')[0], {
			mapTypeControl: false,
			zoomControl: true,
			streetViewControl: false,
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
	
	map.setCenter(new google.maps.LatLng(33.063924, -95.449219));	
	
    if (localStorage && localStorage['location']) {
		
        var dataLocation = window.localStorage['location'].split(';');
        
		var currentLocation = {
			lat : dataLocation[0],
			lng : dataLocation[1]
		};
		
		hubsoft.getDealerLocations({
			lat : currentLocation.lat,
			lng : currentLocation.lng,
			radius : $('#within').val()
		}, function(json){ handleLocations(currentLocation, json); });		

    } else if (navigator.geolocation) {
		
        navigator.geolocation.getCurrentPosition(function (position) {
            
            if (localStorage) {
                localStorage['location'] = position.coords.latitude + ';' + position.coords.longitude;
            }
			
			var loc = {
				lat : position.coords.latitude,
				lng : position.coords.longitude
			};
		
			hubsoft.getDealerLocations({
				lat : loc.lat,
				lng : loc.lng,
				radius : $('#within').val()
			}, function(json){ handleLocations(loc, json); });
			
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
                map.setCenter(results[0].geometry.location);
				
				var loc = {
					lat : results[0].geometry.location.lat(),
					lng : results[0].geometry.location.lng()
				};
				
				hubsoft.getDealerLocations({
					lat : loc.lat,
					lng : loc.lng,
					radius : $('#within').val()
				}, function(json){ handleLocations(loc, json); });
            }
        });
	});

	function handleLocations(currentLocation, json) {

		$.each(markers, function(index, item){
			item.setMap(null);
		});
        if (circleOverlay) {
            circleOverlay.setMap(null);
            circleOverlay = null;
        }
		
		markers = [];
		locations = [];
		
		$.each(json.locations, function(index, location){
			locations.push(new google.maps.LatLng (location.Latitude, location.Longitude));
			var marker = new google.maps.Marker({
				position : (new google.maps.LatLng(location.Latitude, location.Longitude)),
				map : map,
				title : location.StoreName
			});
			marker.infowindow = new google.maps.InfoWindow({
				content : silipint.nunjucks.render('partials/map-info-window.html', location)
			});
			markers.push(marker);
			(function(){
				google.maps.event.addListener(marker, 'click', function () {
					openLocation(marker);
				});
			})({ marker : marker, location : location });
		});
		
        map.setCenter(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));			
		setCircle(currentLocation.lat, currentLocation.lng);
		setBounds();
	}
	
	function openLocation(marker) {
		for(var i = 0; i < markers.length; i++) {
			markers[i].infowindow.close();
		}
		marker.infowindow.open(map, marker);
	}
	
    function setCircle(lat, lng) {
        var location = new google.maps.LatLng(lat, lng);
        var radiusCircle = {
            strokeColor: "#C5C8CD",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#C5C8CD",
            fillOpacity: 0.25,
            map: map,
            radius: 1609.344 * parseInt($('#within').val()), //miles to meters
            center: location
        };
        circleOverlay = new google.maps.Circle(radiusCircle);
		setBounds();
    }
	
	function setBounds() {
		if (!locations.length < 2) {
			map.setZoom(7);
			return; 
		}
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < locations.length; i++) {
			bounds.extend(locations[i]);
		}
		map.fitBounds(bounds);
	}

});