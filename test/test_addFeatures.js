import {addFeatures} from '../utils/addFeatures'

export function test_addFeatures(map) {

  const FeatColl = {
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
        },
        {
          type: "Feature",
          properties: { id: 'waejkl3782hjkwl', name: "Connecting Lines" },
          geometry: {
            "type": "LineString",
            "coordinates": [
              [7.042569, 46.881066],
              [8.7933439, 46.1678596],
              [6.9762993, 46.3150334]
            ],
          }
        }
      ]
  }
  
  // Add Features
  addFeatures(map, FeatColl, {id:"test", linesStyle: {lineWidthForce: 5}});

};