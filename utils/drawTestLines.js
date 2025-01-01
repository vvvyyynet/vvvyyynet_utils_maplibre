export function drawTestLines(map) {
	console.log('DRAWING TEST LINES');

	map.addSource('mylines', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {
						id: 'line123',
						name: 'Connecting Lines'
					},
					geometry: {
						type: 'LineString',
						coordinates: [
							[8.7933439, 46.1678596],
							[7.042569, 46.881066],
							[6.9762993, 46.3150334]
						]
					}
				}
			]
		}
	});

	map.addLayer({
		id: 'mylines_line',
		type: 'line',
		source: 'mylines',
		paint: {
			'line-color': 'blue',
			'line-width': 6,
			'line-opacity': 1
		}
	});
}
