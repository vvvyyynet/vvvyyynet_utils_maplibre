function accumulateKeyValuePairs(keyvaluepairs) {
	// Accumulate all key-value pairs with valid value
	return keyvaluepairs.reduce((acc, [key, value]) => {
		if (value) {
			acc[key] = value;
			//! TODO: feat: add type-checker!!
		}
		return acc;
	}, {});
}

export function addLayer(map, layerId, sourceId, groups, filterId, type, c, root) {
	// ---------------------------------------------------------------------------------------
	// CONSOLE LOGS
	// console.log('ADDLAYER: ', layerId, type, root);

	// ---------------------------------------------------------------------------------------
	// CHECKS

	// Test for duplicate layers
	if (map.getLayer(layerId)) {
		console.warn('duplicate layerId detected: ', layerId);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// ADD LAYER BASED ON TYPE
	switch (type) {
		// -----------------------------------------------------
		// CIRCLE
		case 'circle':
			map = map.addLayer({
				id: layerId,
				type: 'circle',
				source: sourceId,
				metadata: {
					groups: groups
				},
				layout: accumulateKeyValuePairs([
					['visibility', c(`${root}.setInvisible`) ? 'none' : 'visible']
				]),
				paint: accumulateKeyValuePairs([
					['circle-radius', c(`${root}.circleRadius`)],
					['circle-color', c(`${root}.circleColor`)],
					['circle-stroke-color', c(`${root}.circleStrokeColor`)],
					['circle-stroke-width', c(`${root}.circleStrokeWidth`)]
				]),
				filter: ['==', ['get', 'id'], filterId]
			});
			break;

		// -----------------------------------------------------
		// SYMBOL
		case 'symbol':
			map = map.addLayer({
				id: layerId,
				type: 'symbol',
				source: sourceId,
				metadata: {
					groups: groups
				},
				layout: accumulateKeyValuePairs([
					['visibility', c(`${root}.setInvisible`) ? 'none' : 'visible'],
					['icon-image', c('points.symbol.iconImage')],
					['icon-size', c('points.symbol.iconSize')],
					['icon-anchor', c('points.symbol.iconAnchor')],
					['icon-overlap', c('points.symbol.iconOverlap')],
					['text-field', c('points.symbol.textField')],
					['text-offset', c('points.symbol.textOffset')],
					['text-anchor', c('points.symbol.textAnchor')],
					['text-font', c('points.symbol.textFont')]
				]),
				paint: accumulateKeyValuePairs([
					['circle-radius', c(`${root}.circleRadius`)],
					['circle-color', c(`${root}.circleColor`)],
					['circle-stroke-color', c(`${root}.circleStrokeColor`)],
					['circle-stroke-width', c(`${root}.circleStrokeWidth`)]
				]),
				filter: ['==', ['get', 'id'], filterId]
			});
			break;

		// -----------------------------------------------------
		// LINE
		case 'line':
			map = map.addLayer({
				id: layerId,
				type: 'line',
				source: sourceId,
				metadata: {
					groups: groups
				},

				layout: accumulateKeyValuePairs([
					['visibility', c(`${root}.setInvisible`) ? 'none' : 'visible'],
					['line-join', c(`${root}.lineJoin`)],
					['line-cap', c(`${root}.lineCap`)]
				]),
				paint: accumulateKeyValuePairs([
					['line-dasharray', c(`${root}lineDashArray`)],
					['line-color', c(`${root}.lineColor`)],
					['line-opacity', c(`${root}.lineOpacity`)],
					['line-width', c(`${root}.lineWidth`)],
					['line-blur', c(`${root}.lineBlur`)] //! DEBUG: not setting presetStyleset may break
				]),
				//! DEBUG undefined*Number = NaN... does this cause any problems?
				filter: ['==', ['get', 'id'], filterId]
			});
			break;

		// -----------------------------------------------------
		// FILL
		case 'fill':
			map = map.addLayer({
				id: layerId,
				type: type,
				source: sourceId,
				metadata: {
					groups: groups
				},
				layout: accumulateKeyValuePairs([
					['visibility', c(`${root}.setInvisible`) ? 'none' : 'visible']
				]),
				paint: accumulateKeyValuePairs([
					['fill-color', c(`${root}.fillColor`)],
					['fill-pattern', c(`${root}.fillPattern`)], // Note, that setting 'fill-pattern':null will still remove fillColor!! (This is a //! BUG in maplibre)
					['fill-opacity', c(`${root}.fillOpacity`)],
					['fill-antialias', c(`${root}.fillAntialias`)]
				]),
				...accumulateKeyValuePairs([['maxzoom', c(`${root}.maxZoom`)]]),

				filter: ['==', ['get', 'id'], filterId]
			});
			break;
	}

	return map;
}
