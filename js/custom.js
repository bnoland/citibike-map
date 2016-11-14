
function makeInfoWindow(event, svData) {
    var infoWindowDiv = document.createElement("div");
    
    // Set up an element to hold the station name.
    // TODO: The exact field name will probably be different when using the final data.
    var stationName = event.row["station_name"].value;
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
    
    var infoWindow = new google.maps.InfoWindow({
        content: infoWindowDiv,
        position: event.latLng
    });
    
    return infoWindow;
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
    
    // Layer for demo purposes.
    // TODO: Remove.
    var layer = new google.maps.FusionTablesLayer({
        query: {
            select: "location",
            from: "1tR4Le4gcxqQK4EyG8JhnypphlAqpwh9AJLoFkXOL"
        },
        styles : [{
            markerOptions: {
                iconName: "small_blue"
            }
        }],
        suppressInfoWindows: true,
        map: map
    });
    
    var sv = new google.maps.StreetViewService();
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
                infoWindow = makeInfoWindow(event, data);
            else
                infoWindow = makeInfoWindow(event, null);
            
            infoWindow.open(map);
        });
        
        map.panTo(event.latLng);
    });
}
