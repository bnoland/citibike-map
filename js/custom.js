
function initMap() {
    var nyc = new google.maps.LatLng(40.73, -73.99);
    var map = new google.maps.Map(document.getElementById("map"), {
        center: nyc,
        zoom: 12,
        
        // Ensure that the map controls are all at the bottom of the screen.
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
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
        map: map
    });
    
    layer.addListener("click", function(event) {
        map.panTo(event.latLng);
    });
}
