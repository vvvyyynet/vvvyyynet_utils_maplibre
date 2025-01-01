export function drawTestPoints(map) {
console.log('DRAWING TEST POINTS')
map.addSource('mypoints', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [7.042569, 46.881066] },
        properties: { id: 'point123_a', name: 'Römisches Amphitheater Aventicum' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [8.7933439, 46.1678596] },
        properties: { id: 'point123_b', name: 'Castello Visconteo' }
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [6.9762993, 46.3150334] },
        properties: { id: 'point123_c', name: "Château d'Aigle" }
      }
    ]
  }
});

map.addLayer({
  id: 'mypoints_circle',
  type: 'circle',
  source: 'mypoints',
  paint: {
    'circle-radius': 12,
    'circle-color': '#FF0000'
  }
});
}