
function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.773972, lng: -122.431297},
          zoom: 12
        });
      }

function swapMap(navLat, navLng) {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: navLat, lng: navLng},
          zoom: 15,
        });
        var marker = new google.maps.Marker({
            position: {lat: navLat, lng: navLng},
            map: map
        });

      }



$(function() {
    watchSubmit();
});



function watchSubmit() {
    $('.js-search-form').submit(function(){
        event.preventDefault();
        var userInputSearchLocation = $(this).find('.js-userInputSearchLocation').val();
        getResult(userInputSearchLocation);
    });
}


function getResult (userInputSearchLocation) {
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
        
                var terms = 'ramen';
                var near = userInputSearchLocation;
                console.log(12, userInputSearchLocation);
        
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
            row += '<h4>' + biz.name + '</h4>';
            row += '<p>Yelp Rating: ' + biz.rating + '</p>';
            row += '<p>Phone number: ' + biz.display_phone + '</p>';
            row += '<p>Address: </p>';
            row += '<p>' + biz.location.display_address + '</p>';
            row += '<button class="js-swapMap" id="' + biz.id + '" type="button" value="button">Show On Google Map</button>';
        }
        $('.js-search-results').html(row);
        $('.js-swapMap').click(function(event){
            var navBizId = $(this).closest('button').attr('id');
            console.log('biz id: ', navBizId);
            var bizPos = resultBusinesses.map(function(businesses){return businesses.id;}).indexOf(navBizId);
            console.log('15', bizPos);
            console.log('16', resultBusinesses[bizPos].name)
            var navLat = resultBusinesses[bizPos].location.coordinate.latitude;
            var navLng = resultBusinesses[bizPos].location.coordinate.longitude;
            console.log('swap map: latitude: ', navLat, ' longitude: ', navLng);
            swapMap(navLat, navLng);
    });  
}


