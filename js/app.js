var mapState = {
            latitude: 37.773972, 
            longitude: -122.431297,
            map: null
};

var userLocation = {
        latitude: 37.773972,
        longitude: -122.431297
};

var searchResults = {};
var tripDistances = [];
var tripDurations = [];

$(function() {
    initMap();
    watchSubmit();
});


function initMap() {
    mapState.map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: mapState.latitude, lng: mapState.longitude},
          zoom: 12
        });
}
 
function watchSubmit() {
    $('.js-search-form').submit(function(){
        event.preventDefault();
        var userInputSearchLocation = $(this).find('.js-userInputSearchLocation').val();
        var userInputSearchBiz = $(this).find('.js-userInputSearchBiz').val();
        //get user location
        function success(position) {
            userLocation.latitude  = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
        }
        function error() {
            output.innerHTML = "Unable to retrieve your location";
        }
        navigator.geolocation.getCurrentPosition(success, error);
        getResult(userInputSearchBiz, userInputSearchLocation);
    });

    $('.js-search-currentLoc-form').submit(function(){
        event.preventDefault();
        var output = document.getElementById("out");
        var userInputSearchBizCurrentLoc = $(this).find('.js-userInputSearchBiz2').val();
        function success(position) {
            userLocation.latitude  = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            var userInputSearchLocation = userLocation.latitude.toString() + ", " + userLocation.longitude.toString();
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
        
                var terms = 'poke';
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
                        searchResults = results;
                        calculateTrips();
                    }
                )
}


function renderBusinesses() {
        var row = '';
        var businessNum = searchResults.businesses.length;
        var locations=[];
        var bizNames=[];
        var bizInfo=[];
        var markers=[];
        console.log(searchResults);
        var resultBusinesses = searchResults.businesses;
        for (var i = 0; i < businessNum; i++) {
            var biz = resultBusinesses[i];
            var destLat = biz.location.coordinate.latitude;
            var destLng = biz.location.coordinate.longitude;
            row += '<div class="listViewUnit">';
            row += '<div class="bizInfoTitleLine"><h4><a href="' + biz.mobile_url + '" target="_blank">' + biz.name + ' </a>' + '<img src="' + biz.rating_img_url_small + '"></h4><p>';
            row += biz.categories +'</p></div>';
            row += '<p><a href="tel:' + biz.display_phone + '">' + biz.display_phone + '</a>' + ' | ' + tripDistances[i] + ', ' + tripDurations[i] + ' drive.</p>';
            //row += '<p>' + tripDistances[i] + ', ' + tripDurations[i] + ' drive.</p>';
            row += '<p>' + biz.location.display_address + '</p>';
            row += '<div><span><button class="js-swapMap" id="' + biz.id + '" type="button" value="button">Center On Map</button></span> ';
            row += '<span><a href="https://maps.google.com?saddr=Current+Location&daddr=' + destLat +',' + destLng + '"><button>Get Directions</button></a></span></div>';
            row += '</div>';
            var localCoord = {
                    lat: destLat,
                    lng: destLng
            };
            locations.push(localCoord);
            bizNames.push(biz.name);
            var marker = new google.maps.Marker({
                position: {lat: destLat, lng: destLng},
                map: mapState.map
            });
            markers.push(marker);
            bizInfo[i] = biz.name + ' ' + biz.location.display_address + ' ' + biz.display_phone;
            attachBizInfo(marker, bizInfo[i]);
    
        }
        $('.js-search-results').html(row);


        mapState.latitude = searchResults.region.center.latitude;
        mapState.longitude = searchResults.region.center.longitude;
        mapState.map.setCenter({lat: mapState.latitude, lng: mapState.longitude});
        mapState.map.setZoom(12);

        // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(mapState.map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

        $('.js-swapMap').click(function(event){
            var navBizId = $(this).closest('button').attr('id');
            var bizPos = resultBusinesses.map(function(businesses){return businesses.id;}).indexOf(navBizId);
            mapState.latitude = resultBusinesses[bizPos].location.coordinate.latitude;
            mapState.longitude = resultBusinesses[bizPos].location.coordinate.longitude;
            mapState.map.setCenter({lat: mapState.latitude, lng: mapState.longitude});
            mapState.map.setZoom(17); 
        });  
}



function attachBizInfo(marker, bizInfo) {
    var infowindow = new google.maps.InfoWindow({
          content: bizInfo
        });
        marker.addListener('click', function() {
          infowindow.open(marker.get('map'), marker);
        });
}


function calculateTrips() {
    //var origin = "san francisco";
    var origin = {lat: userLocation.latitude, lng: userLocation.longitude};
        for (i=0; i<20; i++) {
            var destination = {lat: searchResults.businesses[i].location.coordinate.latitude, lng: searchResults.businesses[i].location.coordinate.longitude};
            var service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix({
              origins: [origin],
              destinations: [destination],
              travelMode: 'DRIVING',
              unitSystem: google.maps.UnitSystem.IMPERIAL,
              avoidHighways: false,
              avoidTolls: false
              }, function(response) {
                    var results = response.rows[0].elements;
                    //console.log(5, response.rows);
                    console.log(99, results[0].distance.text);
                    tripDistances.push(results[0].distance.text);
                    tripDurations.push(results[0].duration.text);
                    //console.log(90, tripDurations);
                    renderBusinesses();

            });
        }   
}