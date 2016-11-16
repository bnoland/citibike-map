
function makeInfoWindow(event, svData, groupSize) {
    var infoWindowDiv = document.createElement("div");
    
    // Set up an element to hold the station name.
    var stationName = event.row["station.name"].value;
    var stationNameH1 = document.createElement("h1");
    var text = document.createTextNode(stationName);
    stationNameH1.appendChild(text);
    infoWindowDiv.appendChild(stationNameH1);
    
    if (svData != null) {
        // If Street View data is available, set up an element to hold it.
        var panoramaDiv = document.createElement("div");
        panoramaDiv.style.width = "350px";
        panoramaDiv.style.height = "200px";
        infoWindowDiv.appendChild(panoramaDiv);
        
        var panorama = new google.maps.StreetViewPanorama(panoramaDiv, {
            pano: svData.location.pano,
            pov: {
                heading: 270,
                pitch: 0
            },
            visible: true
        });
    }
    
    // Set up an element to hold the number of outgoing groups for this station.
    var number = event.row[groupSize].value;
    var numberP = document.createElement("p");
    var text = document.createTextNode("Number of outgoing groups of specified size(s): " + number);
    numberP.appendChild(text);
    infoWindowDiv.appendChild(numberP);
    
    var infoWindow = new google.maps.InfoWindow({
        content: infoWindowDiv,
        position: event.latLng
    });
    
    return infoWindow;
}

function setLayerData(layer, map, method, month, groupSize) {
    // Associates Fusion Table IDs with methods and months.
    var tableIds = {
        "method1": {
            "january":  "1uAoDFezl7Q-50FmmYyxHWmB7H61Rx7K_7dSEg58H",
            "april":    "1sQQsOEOlG6by0WTN00HAX5fFCzJqsoE6tG69iPoc",
            "july":     "11Ym1s6HmFhQ38r1LZCkLTWDT35Dvo2zAI-uXZfOd",
            "october":  "1KAUmSmkJVacPuztV7pVkVNnMC2vvrUduDGhrAG44"
        },
        "method2": {
            "january":  "1Rs3HCeEVm1De0RfzG3PQxJlsqIrUz753TzuP668O",
            "april":    "15_7id9ILDLx0pPw_624rR3Qg7eTi4y0gf2dh9ttV",
            "july":     "1mCmA5ju-JYh8yzSSdc0cQRIuRC4HBP5DbyBGIJJt",
            "october":  "16-IG-LZwroi-ewVhAnV3UAQfHdavMzTp-6ppJkUw"
        }
    };
    
    layer.setOptions({
        query: {
            select: "location",
            from: tableIds[method][month]
        },
        
        // The marker colors indicate the level of outgoing traffic at each station.
        styles : [{
            where: groupSize + " < 50",
            markerOptions: {
                iconName: "small_blue"
            }
        }, {
            where: groupSize + " >= 50 AND " + groupSize + " < 500",
            markerOptions: {
                iconName: "small_green"
            }
        }, {
            where: groupSize + " >= 500",
            markerOptions: {
                iconName: "small_red"
            }
        }],
        suppressInfoWindows: true,
        map: map
    });
}

function initMap() {
    var nyc = new google.maps.LatLng(40.73, -73.99);
    var map = new google.maps.Map(document.getElementById("map"), {
        center: nyc,
        zoom: 12,
        
        // Ensure that the map controls are all at the bottom of the screen.
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        streetViewControl: false
    });
    
    // The data that defines the current layer.
    var method = document.getElementById("method").value;
    var month = document.getElementById("month").value;
    var groupSize = document.getElementById("group-size").value;
    
    var layer = new google.maps.FusionTablesLayer();
    var sv = new google.maps.StreetViewService();
    
    // Current open info window.
    var infoWindow = null;
    
    layer.addListener("click", function(event) {
        if (infoWindow != null)
            infoWindow.close();
        
        var request = {
            location: event.latLng,
            preference: "nearest"
        };
        
        // Get the Street View data associated with the selected point and use it to generate an
        // info window.
        sv.getPanorama(request, function(data, status) {
            if (status == "OK")
                infoWindow = makeInfoWindow(event, data, groupSize);
            else
                infoWindow = makeInfoWindow(event, null, groupSize);
            
            infoWindow.open(map);
        });
        
        map.panTo(event.latLng);
    });
    
    // Set the initial layer options.
    setLayerData(layer, map, method, month, groupSize);
    
    google.maps.event.addDomListener(document.getElementById("submit"), "click", function() {
        if (infoWindow != null)
            infoWindow.close();
        
        method = document.getElementById("method").value;
        month = document.getElementById("month").value;
        groupSize = document.getElementById("group-size").value;
        
        setLayerData(layer, map, method, month, groupSize);
    });
}
