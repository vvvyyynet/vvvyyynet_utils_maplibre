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

export function addLayer(map, layerId, sourceId, groupNames, filterId, layerType, c, stylesetPath) {
	// ---------------------------------------------------------------------------------------
	// CONSOLE LOGS
	// console.log('ADDLAYER: ', layerId, layerType, stylesetPath);

	// ---------------------------------------------------------------------------------------
	// CHECKS

	// Test for duplicate layers
	if (map.getLayer(layerId)) {
		console.warn('duplicate layerId detected: ', layerId);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// ADD LAYER
	if (
		[
			'fill',
			'circle',
			'line',
			'symbol'
			// 'heatmap',
			// 'fill-extrusion',
			// 'raster',
			// 'hillshade',
			// 'background'
		].includes(layerType)
	) {
		map = map.addLayer({
			id: layerId,
			type: layerType,
			metadata: {
				'group:names': groupNames
			},
			source: sourceId,
			...accumulateKeyValuePairs(
				[['minzoom', c(stylesetPath, 'minzoom', layerType, {})]],
				[['maxzoom', c(stylesetPath, 'maxzoom', layerType, {})]]
			),
			filter: ['==', ['get', 'id'], filterId],
			layout: accumulateKeyValuePairs(
				LP[layerType].layout.map((prop) => {
					return [prop.name, c(stylesetPath, prop.camelCaseName, `${layerType}.layout`, {})];
				})
			),
			paint: accumulateKeyValuePairs(
				LP[layerType].paint.map((prop) => {
					return [prop.name, c(stylesetPath, prop.camelCaseName, `${layerType}.paint`, {})];
				})
			)
		});
	}
	return map;
}
