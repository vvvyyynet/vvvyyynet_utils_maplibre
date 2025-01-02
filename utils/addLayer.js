import { layerProperties as LP } from '../layerPropertiesKebabCamelType.ts';

function accumulateKeyValuePairs(keyvaluepairs) {
	// Accumulate all key-value pairs with valid value
	return keyvaluepairs.reduce((acc, [key, value]) => {
		if (value !== undefined && value !== null) {
			// only add keys with non-nullish values to the list
			acc[key] = value;
		}
		return acc;
	}, {});
}

export function addLayer(map, layerId, sourceId, groupNames, filterId, type, c, root) {
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
				metadata: {
					'group:names': groupNames
				},
				source: sourceId,
				...accumulateKeyValuePairs(
					[['minzoom', c(root, 'minZoom', 'circle', {})]],
					[['maxzoom', c(root, 'maxZoom', 'circle', {})]]
				),
				filter: ['==', ['get', 'id'], filterId],
				layout: accumulateKeyValuePairs(
					LP.circle.layout.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'circle.layout', {})];
					})
				),
				paint: accumulateKeyValuePairs(
					LP.circle.paint.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'circle.paint', {})];
					})
				)
			});
			break;

		// -----------------------------------------------------
		// SYMBOL
		case 'symbol':
			map = map.addLayer({
				id: layerId,
				type: 'symbol',
				metadata: {
					'group:names': groupNames
				},
				source: sourceId,
				...accumulateKeyValuePairs(
					[['minzoom', c(root, 'minZoom', 'symbol', {})]],
					[['maxzoom', c(root, 'maxZoom', 'symbol', {})]]
				),
				filter: ['==', ['get', 'id'], filterId],
				layout: accumulateKeyValuePairs(
					LP.symbol.layout.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'symbol.layout', {})];
					})
				),
				paint: accumulateKeyValuePairs(
					LP.symbol.paint.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'symbol.paint', {})];
					})
				)
			});
			break;

		// -----------------------------------------------------
		// LINE
		case 'line':
			map = map.addLayer({
				id: layerId,
				type: 'line',
				metadata: {
					'group:names': groupNames
				},
				source: sourceId,
				...accumulateKeyValuePairs(
					[['minzoom', c(root, 'minZoom', 'line', {})]],
					[['maxzoom', c(root, 'maxZoom', 'line', {})]]
				),
				filter: ['==', ['get', 'id'], filterId],
				layout: accumulateKeyValuePairs(
					LP.line.layout.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'line.layout', {})];
					})
				),
				paint: accumulateKeyValuePairs(
					LP.line.paint.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'line.paint', {})];
					})
				)
			});
			break;

		// -----------------------------------------------------
		// FILL
		case 'fill':
			map = map.addLayer({
				id: layerId,
				type: type,
				metadata: {
					'group:names': groupNames
				},
				source: sourceId,
				...accumulateKeyValuePairs(
					[['minzoom', c(root, 'minZoom', 'fill', {})]],
					[['maxzoom', c(root, 'maxZoom', 'fill', {})]]
				),
				filter: ['==', ['get', 'id'], filterId],
				layout: accumulateKeyValuePairs(
					LP.fill.layout.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'fill.layout', {})];
					})
				),
				paint: accumulateKeyValuePairs(
					LP.fill.paint.map((prop) => {
						return [prop.name, c(root, prop.camelCaseName, 'fill.paint', {})];
					})
				)
			});
			break;
	}

	return map;
}
