//load mapbox accessToken
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhbGltb25lIiwiYSI6ImNrNmxmOXNqNzBlZnEzZG52M3dqdTF2anEifQ._jw03o430C3a-tly3N6-DQ';

//map centered on NYC
var initialCenterPoint = [-73.9712, 40.7128]
var initialZoom = 9.4

//colors and breaks for the choropleth map
var COLORS = ['#ffd1a9', '#ff9e79', '#fb6d4c', '#c23b22', '#8a0000', '#580000'],
BREAKS = [0, 49181.99, 60282.99, 69936.99, 85155.99, 282189],
FILTERUSE;

// set the default text for the feature-info div
var defaultText = '<p>Move the mouse over the map to get median income of a zip code in NYC</p>'
$('#tooltip-name).html(defaultText)

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
      property: 'VALUE0', //variable for median income
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
        map.on('mousemove', function (e) {
            // query for the features under the mouse, but only in the lots layer
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['med-income-nyc'],
            });

            // if the mouse pointer is over a feature on our layer of interest
            // take the data for that feature and display it in the sidebar
            if (features.length > 0) {
              map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

              var hoveredFeature = features[0]
              var featureInfo = `
                <h4>${hoveredFeature.properties.spatial_id}</h4>
                <p><strong>Median Income:</strong> ${COLORS(parseInt(hoveredFeature.properties.VALUE0))}</p>
                <p><strong>Zip Code:</strong> ${hoveredFeature.properties.spatial_id}</p>
              }

              $('#feature-info').html(featureInfo)

              // set this lot's polygon feature as the data for the highlight source
              map.getSource('tooltip-name').setData(hoveredFeature.geometry);
            } else {
              // if there is no feature under the mouse, reset things:
              map.getCanvas().style.cursor = 'default'; // make the cursor default

              // reset the highlight source to an empty featurecollection
              map.getSource('highlight-feature').setData({
                type: 'tooltip-name',
                features: []
              });

              // reset the default message
              $('#tooltip-name').html(defaultText)
            }
          })

        });
