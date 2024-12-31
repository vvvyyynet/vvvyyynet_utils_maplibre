import { addFeatureCollection } from '../utils/addFeatureCollection';
import { styleset } from './DEFAULT_STYLES';

export function test_addFeatures(map) {
	const FeatColl = {
		type: 'FeatureCollection',
		features: [
			// A Point
			{
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [7.042569, 46.881066] },
				properties: {
					circleColor: 'yellow',
					id: '49f56x10831cs7p',
					name: 'Römisches Amphitheater Aventicum',
					temperature: 100,
					style: {}
				}
			},
			// A Line
			{
				type: 'Feature',
				properties: {
					id: 'feature-1',
					name: 'Connecting Lines',
					myLineWidth: 1000,
					style: {}
				},
				geometry: {
					type: 'LineString',
					coordinates: [
						[7.042569, 46.881066],
						[8.7933439, 46.1678596],
						[6.9762993, 46.3150334]
					]
				}
			},
			// Two more Points
			{
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [8.7933439, 46.1678596] },
				properties: { id: 'feature-2', name: 'Castello Visconteo', temperature: 20 }
			},
			{
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [6.9762993, 46.3150334] },
				properties: { id: 'feature-3', name: "Château d'Aigle", temperature: 10 }
			},

			// Polygon
			{
				type: 'Feature',
				properties: { id: 'feature-4', mycolor: 'purple' },
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[6.982512172174637, 47.0170017421359],
							[6.87321077318353, 46.97633918856454],
							[6.87210671864824, 46.94695254421592],
							[6.811383719208351, 46.91905798587277],
							[6.622590393676916, 46.80280020920381],
							[6.65902419334131, 46.78390344155184],
							[6.728579629063262, 46.805067375437346],
							[6.761701265120905, 46.80280020920381],
							[7.050963553361413, 46.98537798567847],
							[6.982512172174637, 47.0170017421359]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {"id": "bar"},
				"geometry": {
					"coordinates": [
						[
							6.82124077973134,
							47.00637166799734
						],
						[
							7.0203991106476735,
							46.89189219766652
						]
					],
					"type": "LineString"
				}
			},
			{
				"type": "Feature",
				"properties": {"id": "foo"},
				"geometry": {
					"coordinates": [
						6.814925764335101,
						46.88522781547138
					],
					"type": "Point"
				}
			}
		]
	};

	// Add Features
	let idCollector;
	({ map: map, idCollector: idCollector } = addFeatureCollection(map, FeatColl, {
		id: 'test',
		idCollector: {},
		sortByTypesArray: ['lines',  'polygons', 'points'],
		acceptTopLevelFeatureProps: false,
		featStylesetKey: 'style',
		presetStyleset: styleset,
		collStyleset: {
			force: {
				points: {
				},
				lines: {
					lineDashArray: [4, 4],
					lineCap: 'round',
					lineJoin: 'round',
					lineColor: 'black',
					hasGlow: true,
					lineWidth: ['interpolate', ['linear'], ['zoom'], 0, 20, 10, 5, 20, 900],
					glow: {
						lineWidthGlowFactor: 1.6,
						lineColor: 'red',
						// lineCap: 'round',
						lineBlur: 5,
						lineDashArray: [2, 2]
					}
				},
				polygons: {
					fillColor: ['coalesce', ['string', ['get', 'mycolor']], ['rgb', 255, 200, 0]]
				}
			},
			points: {
				type: 'circle',
				circle: {
					circleRadius: 25,
					circleColor: ['rgb', ['get', 'temperature'], 0, ['-', 100, ['get', 'temperature']]]
				}
			},
			lines: {},
			polygons: {}
		},
		
	}));

	console.log(idCollector);
}
