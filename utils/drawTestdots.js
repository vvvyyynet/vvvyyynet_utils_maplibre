export function drawTestdots(map) {
map.addSource('mypoints', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [7.042569, 46.881066] },
        properties: { id: '49f56x10831cs7p', name: 'Römisches Amphitheater Aventicum' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [8.7933439, 46.1678596] },
        properties: { id: 'qmq36u8z9b2x5nc', name: 'Castello Visconteo' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [6.9762993, 46.3150334] },
        properties: { id: 'c6079rsfypjj863', name: "Château d'Aigle" }
      }
    ]
  }
});

// Add a simple circle layer to display the points
map.addLayer({
  id: 'point-layer',
  type: 'circle',
  source: 'mypoints',
  paint: {
    'circle-radius': 12, // Size of the circle
    'circle-color': '#FF0000' // Color of the circle
  }
});
}