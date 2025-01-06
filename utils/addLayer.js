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

export function addLayer(map, layerId, sourceId, groupNames, filterId, type, c, stylesetPath) {
	// ---------------------------------------------------------------------------------------
	// CONSOLE LOGS
	// console.log('ADDLAYER: ', layerId, type, stylesetPath);

	// ---------------------------------------------------------------------------------------
	// CHECKS

	// Test for duplicate layers
	if (map.getLayer(layerId)) {
		console.warn('duplicate layerId detected: ', layerId);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// ADD LAYER
	if (['fill', 'circle', 'line', 'circle'].includes(type)) {
		map = map.addLayer({
			id: layerId,
			type: type,
			metadata: {
				'group:names': groupNames
			},
			source: sourceId,
			...accumulateKeyValuePairs(
				[['minzoom', c(stylesetPath, 'minZoom', type, {})]],
				[['maxzoom', c(stylesetPath, 'maxZoom', type, {})]]
			),
			filter: ['==', ['get', 'id'], filterId],
			layout: accumulateKeyValuePairs(
				LP[type].layout.map((prop) => {
					return [prop.name, c(stylesetPath, prop.camelCaseName, `${type}.layout`, {})];
				})
			),
			paint: accumulateKeyValuePairs(
				LP[type].paint.map((prop) => {
					return [prop.name, c(stylesetPath, prop.camelCaseName, `${type}.paint`, {})];
				})
			)
		});
	}
	return map;
}
