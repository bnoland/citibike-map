
function updateMapHeight() {
    // Make the map fill the height of the viewport.
    
    var marginBottom = parseInt($("#map").css("margin-bottom"), 10);
    var navBarHeight = $(".navbar").outerHeight(true);
    var newHeight = $(window).height() - navBarHeight - marginBottom;
    
    $("#map").height(newHeight);
}

function makeInfoWindow(event, svData, groupSize) {
    var stationName = event.row["station.name"].value;
    var number = event.row[groupSize].value;
    var infoWindowDiv =
        $("<div> \
               <h1>" + stationName + "</h1> \
               <p>Number of outgoing groups of specified size(s): " + number + "</p> \
           </div>");
    
    if (svData != null) {
        // If Street View data is available, set up an element to hold it.
        var panoramaDiv = $("<div class='panorama'></div>");
        infoWindowDiv.children("h1").append(panoramaDiv);
        
        var panorama = new google.maps.StreetViewPanorama(panoramaDiv[0], {
            pano: svData.location.pano,
            pov: {
                heading: 270,
                pitch: 0
            },
            visible: true
        });
    }
    
    var infoWindow = new google.maps.InfoWindow({
        content: infoWindowDiv[0],
        position: event.latLng
    });
    
    return infoWindow;
}

function setLayerData(layer, map, method, month, groupSize) {
    // Associates Fusion Table IDs with methods and months.
    var tableIds = {
        "method1": {
            "january":  "1mMVrepaGGNzk0kaI--3uvK915Xg2e-2e1iQVRmtA",
            "april":    "1_F1DaWP4sdgX3zLhEYF3uIXw33jYZ3NGLTFDVzoS",
            "july":     "1Td2BoiuAbM2zybxZGySDRboNTWsYHSUupfNR_hh3",
            "october":  "1Z818EwvQfmGwuGj2uIA9f0esUlz78Gga2Dzv7ScH"
        },
        "method2": {
            "january":  "1ow8C60LJaiZhKyO0lAo3N_3uMtA1B2MFMMdfNlzY",
            "april":    "19jmI8MyXvrBu70Ls2W2FRabYC6D58vH51knu-BCB",
            "july":     "1Is4fFH6u9PpCYimK037y04vFtKfE4w6_ayrxHzOm",
            "october":  "1tzSjKhwtR68c58fu1jx_LVQN0jL4QKSEu0pS8xM6"
        }
    };
    
    layer.setOptions({
        query: {
            select: "location",
            from: tableIds[method][month],
            where: groupSize + " > 0"
        },
        
        // The marker colors indicate the level of outgoing traffic at each station.
        styles : [{
            where: groupSize + " < 50",
            markerOptions: {
                iconName: "small_green"
            }
        }, {
            where: groupSize + " >= 50 AND " + groupSize + " < 500",
            markerOptions: {
                iconName: "small_yellow"
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
    var map = new google.maps.Map($("#map")[0], {
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
    var method = $("#method").val();
    var month = $("#month").val();
    var groupSize = $("#group-size").val();
    
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
    
    google.maps.event.addDomListener($("#submit")[0], "click", function() {
        if (infoWindow != null)
            infoWindow.close();
        
        method = $("#method").val();
        month = $("#month").val();
        groupSize = $("#group-size").val();
        
        setLayerData(layer, map, method, month, groupSize);
    });
    
    // Set the initial map height.
    updateMapHeight();
    
    google.maps.event.addDomListener(window, "resize", function() {
        updateMapHeight();
    });
    
    google.maps.event.addDomListener($("#center-map")[0], "click", function() {
        map.panTo(nyc);
    });
}
