import { addFeatures } from '../utils/addFeatures';

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
				type: 'Feature',
				properties: { id: 'waejkl3782hjkwl', name: 'Connecting Lines' },
				geometry: {
					type: 'LineString',
					coordinates: [
						[7.042569, 46.881066],
						[8.7933439, 46.1678596],
						[6.9762993, 46.3150334]
					]
				}
			},
			{
				type: 'Feature',
				properties: {id: 'awefkjl'},
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
			}
		]
	};

	// Add Features
	addFeatures(map, FeatColl, {
		id: 'test',
		manualStyle: {
      force: {
      },
			linesStyle: {
				lineWidth: 1,
				lineColor: 'black',
				hasGlow: true,
				glowStyle: { lineWidthGlowFactor: 5, glowBlur: 5 },
			},
			pointsStyle: {
				circleStyle: {
					circleRadius: 6
				}
			},
			polygonStyle: {}
		}
	});
}
