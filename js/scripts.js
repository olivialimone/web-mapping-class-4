//load my mapbox accessToken
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhbGltb25lIiwiYSI6ImNrNmxmOXNqNzBlZnEzZG52M3dqdTF2anEifQ._jw03o430C3a-tly3N6-DQ';

//map centered on NYC
var initialCenterPoint = [-73.9712, 40.7128]
var initialZoom = 9.4

// set the default text for the feature-info div
var defaultText = '<p>Move the mouse over an area to find out the median income of a zip code</p>'
$('#feature-info').html(defaultText)

// create map container
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/light-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level (0-18)
}

// create the map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

  // add a geojson source to the map using our external geojson file
  map.addSource('med-income-nyc', {
    type: 'geojson',
    data: './data/med-income-nyc.geojson',
  });

  // log the current map state to the console
  console.log(map.getStyle().sources)

  // add color breaks for income based on our data
  // darker shades of red denotes higher income
  map.addLayer({
    id: 'fill-med-income-nyc',
    type: 'fill',
    source: 'med-income-nyc',
    paint: {
      'fill-color': {
        property: 'VALUE0',
        stops: [
          [
            0,
            '#ffd1a9',
          ],
          [
            49181.99,
            '#ff9e79',
          ],
          [
            60282.99,
            '#fb6d4c',
          ],
          [
            69936.99,
            '#c23b22',
          ],
          [
            85155.99,
            '#8a0000',
          ],
          [
            282189,
            '#580000',
          ],
        ]
      },
      "fill-opacity": 0.7,
      "fill-outline-color": "#ffffff"
    }
  })

  // add an empty data source, which we will use to highlight the zip code the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 2,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });

  //changing format of raw median income numbers to currency
var string = numeral(VALUE0).format('$0,0.00')

  // listen for the mouse moving over the map and react when the cursor is over our data
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-med-income-nyc'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      //display the zip code and median income of zip code in sidebar
      var hoveredFeature = features[0]
      var featureInfo = `
        <p><strong>Median Income:</strong> ${hoveredFeature.properties.string}</p>
        <p><strong>Zip Code:</strong> ${hoveredFeature.properties.name}</p>
      `
      $('#feature-info').html(featureInfo)

      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    } else {
      // if there is no feature under the mouse, reset things:
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });

      // reset the default message
      $('#feature-info').html(defaultText)
    }
  })

})
