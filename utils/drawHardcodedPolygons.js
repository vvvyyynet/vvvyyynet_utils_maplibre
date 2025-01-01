export function drawHardcodedPolygons(map) {
	console.log('DRAWING TEST POLYGONS');

	// ------------------------------------------------
	// Polygons
	// ------------------------------------------------
	map.addSource('mypolygons', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { id: 'polygon123', name: 'Polygon around lakes' },
					geometry: {
						type: 'Polygon',
						coordinates: [
							[
								[7.488463779507924, 46.73276113931186],
								[7.749889172849748, 46.6056915400234],
								[8.152919987584482, 46.717827279248866],
								[8.16018180406607, 46.8123385751162],
								[7.80072188822183, 46.772564555136796],
								[7.695425549236887, 46.852083201806835],
								[7.488463779507924, 46.73276113931186]
							]
						]
					}
				}
			]
		}
	});

	map.addLayer({
		id: 'mypolygons_line',
		type: 'line',
		source: 'mypolygons',
		paint: {
			'line-color': 'blaack',
      'line-width': 2,
			'line-opacity': 0.5
		}
	});
	map.addLayer({
		id: 'mypolygons_fill',
		type: 'fill',
		source: 'mypolygons',
		paint: {
			'fill-color': 'blue',
			'fill-opacity': 0.2
		}
	});
}
