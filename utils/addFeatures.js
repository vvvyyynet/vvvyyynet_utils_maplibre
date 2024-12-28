import { addLayer } from './addLayer';
export function addFeatures(
	map,
	FeatColl,
	FEATURES,
	{
		id = undefined,
		id_prefix = undefined,
		groupNames = undefined,
		style = undefined,
		default_iconName = undefined
	}
) {
	// Function Arguments
	// - map
	// - FeatColl: featureCollection (in geojson format)
	// - (id)
	// - (id_prefix): id_prefix for the ids (e.g. "static", "database", ...)
	// - (groupNames): used for toggling/filtering.
	// - (style): used for styling, can be contained in the geojson > properties > style.

	// Generate random default id
	if (!id) {
		id = String(Math.random()).slice(2);
	}

	// Generate sourceId
	const sourceId = id_prefix ? [id_prefix, id].join('-') : id;
	// Add Source if not exist (//! BEWARE: expect HMR errors, if you force readding!)
	if (!map.getSource(sourceId)) {
		map.addSource(sourceId, {
			type: 'geojson',
			data: FeatColl
		});
	}

	// Add Layers
	FeatColl.features.forEach((feature, index) => {
		const layerId = [id_prefix, id, index + 1].join('-');
		const has_glow = feature.metadata?.has_glow || false;
		addLayer(
			map,
			FEATURES,
			feature,
			sourceId,
			layerId,
			style,
			groupNames,
			has_glow,
			default_iconName
		);
	});
}