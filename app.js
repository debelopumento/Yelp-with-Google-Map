var coordState = {
    coords: {
        lattitude: 37.773972, 
        longitude: -122.431297
    }    
}




function initMap(coordState) {
        //var currentCoords = coordState;
        //console.log(coordState);
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.773972, lng: -122.431297},
          zoom: 12
        });
}
 
function swapMap(bizName, navLat, navLng) {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: navLat, lng: navLng},
          zoom: 16,
        });

        var marker = new google.maps.Marker({
            position: {lat: navLat, lng: navLng},
            label: bizName,
            map: map
        });
        var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(map);

}


function markerclustering(results) {
        var locations=[];
        var businessNum = results.businesses.length;
        var resultBusinesses = results.businesses;
        var latT=0;
        var lngT=0;
        for (var i = 0; i < businessNum; i++) {
            var localLat = results.businesses[i].location.coordinate.latitude;
            var localLng = results.businesses[i].location.coordinate.longitude;
            var localCoord = {
                    lat: localLat,
                    lng: localLng
            };
            latT = latT + localLat;
            lngT = lngT + localLng;
            locations.push(localCoord);
        }
        var centerLat = latT / businessNum;
        var centerLng = lngT / businessNum;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {lat: centerLat, lng: centerLng}
        });
        
        //show traffic
        var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(map);

        var markers = locations.map(function(location, i) {
          return new google.maps.Marker({
            position: location,
            //label: labels[i % labels.length]
          });
        });

        // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
      }
      



$(function() {
    watchSubmit();
});



function watchSubmit() {
    $('.js-search-form').submit(function(){
        event.preventDefault();
        var userInputSearchLocation = $(this).find('.js-userInputSearchLocation').val();
        var userInputSearchBiz = $(this).find('.js-userInputSearchBiz').val();
        console.log(27, userInputSearchBiz);
        getResult(userInputSearchBiz, userInputSearchLocation);
    });

    $('.js-search-currentLoc-form').submit(function(){
        event.preventDefault();
        var output = document.getElementById("out");
        var userInputSearchBizCurrentLoc = $(this).find('.js-userInputSearchBiz2').val();
        function success(position) {
            var userLatitude  = position.coords.latitude;
            var userLongitude = position.coords.longitude;
            var userInputSearchLocation = userLatitude.toString() + ", " + userLongitude.toString();
            getResult(userInputSearchBizCurrentLoc, userInputSearchLocation);
        }
        function error() {
            output.innerHTML = "Unable to retrieve your location";
        }
        navigator.geolocation.getCurrentPosition(success, error);      
    });    

}


function getResult (userInputSearchBiz, userInputSearchLocation) {
                function cb(data) {        
                    console.log("cb: " + JSON.stringify(data));
                }
                var auth = {
                    consumerKey : "msiwtsUTuGQOvXSRTkbO7g",
                    consumerSecret : "wBbvE-5SnXxv2VpByelMxNuwSeA",
                    accessToken : "EDLGL4ThVxyrRmjK-pCF0nXIyJbykQPG",
                    accessTokenSecret : "sJYJ1q-vjDyve2cW8oN_ZSiMV2M",
                    serviceProvider : {
                        signatureMethod : "HMAC-SHA1"
                    }
                };
        
                var terms = userInputSearchBiz;
                var near = userInputSearchLocation;
        
                var accessor = {
                    consumerSecret : auth.consumerSecret,
                    tokenSecret : auth.accessTokenSecret
                };

                var parameters = [];
                parameters.push(['term', terms]);
                parameters.push(['location', near]);
                parameters.push(['callback', 'cb']);
                parameters.push(['oauth_consumer_key', auth.consumerKey]);
                parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
                parameters.push(['oauth_token', auth.accessToken]);
                parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        
                var message = {
                    'action' : 'https://api.yelp.com/v2/search',
                    'method' : 'GET',
                    'parameters' : parameters
                };
        
                OAuth.setTimestampAndNonce(message);
                OAuth.SignatureMethod.sign(message, accessor);
        
                var parameterMap = OAuth.getParameterMap(message.parameters);
                    
                $.ajax({
                    'url' : message.action,
                    'data' : parameterMap,
                    'dataType' : 'jsonp',
                    'jsonpCallback' : 'cb',
                    'cache': true,
                })

                .done(function(results) {
                        markerclustering(results);
                        renderBusinesses(results);
                    }
                )
                
}


function renderBusinesses(results) {
        var row = '';
        var businessNum = results.businesses.length;
        console.log(results);
        var resultBusinesses = results.businesses;
        for (var i = 0; i < businessNum; i++) {
            var biz = resultBusinesses[i];
            row += '<div>';
            row += '<div class="bizInfoTitleLine"><h4><a href="' + biz.mobile_url + '" target="_blank">' + biz.name + '          </a>' + '<img src="' + biz.rating_img_url_small + '"></h4></div>';
            row += '<p>Call: ' + '<a href="tel:' + biz.display_phone + '">' + biz.display_phone + '</a>';
            row += '<p>' + biz.location.display_address + '</p>';
            row += '<div class="mapping"><span><button class="js-swapMap" id="' + biz.id + '" type="button" value="button">Center On Map</button></span>';
            var destLat = resultBusinesses[i].location.coordinate.latitude;
            var destLng = resultBusinesses[i].location.coordinate.longitude;
            row += '<span><a class="goToGoogleMap" href="https://maps.google.com?saddr=Current+Location&daddr=' + destLat +',' + destLng + '">Get Directions</a></span></div>';
            row += '</div>';
        }
        $('.js-search-results').html(row);
        $('.js-swapMap').click(function(event){
            var navBizId = $(this).closest('button').attr('id');
            var bizPos = resultBusinesses.map(function(businesses){return businesses.id;}).indexOf(navBizId);
            var navLat = resultBusinesses[bizPos].location.coordinate.latitude;
            var navLng = resultBusinesses[bizPos].location.coordinate.longitude;
            swapMap(resultBusinesses[bizPos].name, navLat, navLng);
    });  
}


