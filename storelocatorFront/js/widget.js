var coordinatesObj = {
    "lng": 0,
    "lat": 0
};

var allStores = [ {
                    "_id" : "a",
                    "name" : "Store A",
                    "address" : "123 Fake Street",
                    "location" : new google.maps.LatLng(37.410323, -122.139319)
                  },
                  {
                    "_id" : "b",
                    "name" : "Store B",
                    "address" : "234 Inauthentic Avenue",
                    "location" : new google.maps.LatLng(37.405210, -122.176055)
                  },
                  {
                    "_id" : "c",
                    "name" : "Store C",
                    "address" : "345 Phony Way",
                    "location" : new google.maps.LatLng(37.429683, -122.226609)
                  },
                  {
                    "_id" : "d",
                    "name" : "Store D",
                    "address" : "456 Sham Promenade",
                    "location" : new google.maps.LatLng(37.365996, -121.995167)
                  },
                  {
                    "_id" : "e",
                    "name" : "Store E",
                    "address" : "567 Fraud Drive",
                    "location" : new google.maps.LatLng(37.476256, -122.185730)
                  }
                  ]

function getCoordinates(options, complete) {
    var geocoder = new google.maps.Geocoder(),
        request;
    console.log(options);
    if (options.zipcode) {
        console.log(zipcode);
        request = {
            'address': options.zipcode
        };
    } else {
        console.log("need to enter zipcode");
    };

    geocoder.geocode(request, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results.length > 0) {
                coordinatesObj.lng = results[0].geometry.location.lng();
                coordinatesObj.lat = results[0].geometry.location.lat();
                complete(coordinatesObj);
                return;
            }
        } else {
            console.log('error: ' + status);
            complete();
        };
    });
};

function sortWithIndices(toSort) {
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function (left, right) {
        return left[0] < right[0] ? -1 : 1;
    });
    toSort.sortedIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortedIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

function printResults(sortedIdx,
                      distances,
                      originCoord) {
    var numStores = sortedIdx.length;
    var curIdx;
    var outcomes = [];
    curIdx = sortedIdx[0];
    document.getElementById('storename').textContent = allStores[curIdx].name;
    document.getElementById('storeaddress').textContent = allStores[curIdx].address;
    document.getElementById('storedistance').textContent = distances[curIdx] + " mi";
    // var link = "https://www.google.com/maps?q=" + allStores[curIdx].location.lat() + "," + allStores[curIdx].location.lng();
    var link = "https://www.google.com/maps/dir/Current+Location/" + allStores[curIdx].location.lat() + "," + allStores[curIdx].location.lng();
    document.getElementById('storedirections').href = link;
    var center = allStores[curIdx].location;
    map.panTo(center);
    
    for (var i = 0; i < numStores; i++) {
        curIdx = sortedIdx[i];
        if (allStores[curIdx].name != null && distances[curIdx] != null) {
            var curOutcome = allStores[curIdx].name + " is " + distances[curIdx] + " miles away."
            outcomes.push(curOutcome);
        }
    }
    if (outcomes.length == numStores) {
        console.log(outcomes);
    }
}

function getNearestStores(origin) {

    var originCoord = new google.maps.LatLng(origin.lat, origin.lng);

    // Using Google's Map API Distance Matrix Service
    var service = new google.maps.DistanceMatrixService();
    var numStores = allStores.length;
    var curSmallestDist = -1;
    var curNearestIndex = -1;
    var allStoresDistances = [];
    var originalDistances = [];

    for (var i = 0; i < numStores; i++) {
        service.getDistanceMatrix({
            origins: [originCoord],
            destinations: [allStores[i].location],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false,
            durationInTraffic: false
        }, function (response, status) {
            if (status != google.maps.DistanceMatrixStatus.OK) {
                alert('Error was: ' + status);
            } else {
                if (response.rows[0].elements[0].distance == null) {
                    return;
                }
                var curDist = Math.round(response.rows[0].elements[0].distance.value / 1000);

                // All callbacks returned.
                if (allStoresDistances.push(curDist) == numStores) {
                    originalDistances = allStoresDistances.slice(0);
                    sortWithIndices(allStoresDistances);
                    printResults(allStoresDistances.sortedIndices,
                                 originalDistances,
                                 originCoord);
                    
                }
            }
        });
    }
}

window.addEventListener("load", function () {
    var searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', handleZipcode, false);

    function handleZipcode(e) {
        var zipcode = document.getElementById('zipcode').value;
        var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
        if (isValidZip) {
            getCoordinates({
                zipcode: zipcode
            }, function (coordinates) {
                var resultString = "received coordinates: (" + coordinates.lng + ", " + coordinates.lat + ")";
                // document.getElementById('coordinates').textContent = resultString;
                getNearestStores(coordinates);
            });
        } else {
            resultString = "Zipcode entered is invalid.";
            document.getElementById('coordinates').textContent = resultString;
        }
    } 
}, false);

google.maps.event.addDomListener(window, 'load', getNearestStores);






