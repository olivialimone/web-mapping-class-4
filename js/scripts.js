//load mapbox accessToken
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhbGltb25lIiwiYSI6ImNrNmxmOXNqNzBlZnEzZG52M3dqdTF2anEifQ._jw03o430C3a-tly3N6-DQ';

var initialCenterPoint = [-81.5158, 27.6648]
var initialZoom = 5.8

//globals for the choropleth
var COLORS = ['#ffd1a9', '#ff9e79', '#fb6d4c', '#c23b22', '#8a0000', '#580000'],
BREAKS = [0, 49181.99, 60282.99, 69936.99, 85155.99, 282189],
FILTERUSE;

// set the default text for the feature-info div
var defaultText = '<p>Move the mouse over the map to get median income of a zip code in NYC</p>'
$('#feature-info').html(defaultText)

//create a map using the Mapbox Light theme, zoomed in to DC
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/light-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level
}

// create the new map
var map = new mapboxgl.Map(initOptions);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//data source: http://opendata.dc.gov/datasets/e87a760828844422afe864a6754049c2_20?geometry=-77.297%2C38.854%2C-76.732%2C38.934
map.on('style.load', function () {
//add geojson source
  map.addSource('med-income-nyc', {
    type: 'geojson',
    data: './data/med-income-nyc.geojson',
});

// let's make sure the source got added by logging the current map state to the console
console.log(map.getStyle().sources)

map.addLayer({
  "id": "zips-nyc",
  "type": "fill",
  "source": "med-income-nyc",
  "paint": {
    "fill-color": {
      property: 'VALUE0',
      stops: [
        [BREAKS[0], COLORS[0]],
        [BREAKS[1], COLORS[1]],
        [BREAKS[2], COLORS[2]],
        [BREAKS[3], COLORS[3]],
        [BREAKS[4], COLORS[4]],
        [BREAKS[5], COLORS[5]]]
            },
          "fill-opacity": 0.7,
          "fill-outline-color": "#ffffff"
                }
            });
        });

        map.on("mousemove", function (e) {
            var features = map.queryRenderedFeatures(e.point, {
                layers: ["spatial_id"]
            });

            if (features.length) {
                //show name and value in sidebar
                document.getElementById('tooltip-name').innerHTML = "Zip Code " + features[0].properties.spatial_id;
                document.getElementById('tooltip').innerHTML = Math.round(features[0].properties.VALUE0);
                //for troubleshooting - show complete features info
                //document.getElementById('tooltip').innerHTML = JSON.stringify(features, null, 2);
            } else {
                //if not hovering over a feature set tooltip to empty
                document.getElementById('tooltip-name').innerHTML = "";
                document.getElementById('tooltip').innerHTML = "";
            }
        });
