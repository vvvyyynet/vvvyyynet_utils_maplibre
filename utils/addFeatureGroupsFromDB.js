// ----------------------
// Helper Functions
function decodeHtmlEntities(str) {
	//!DEBUG check if really safe
	const entities = {
		'&quot;': '"',
		'&apos;': "'",
		'&lt;': '<',
		'&gt;': '>',
		'&amp;': '&'
	};
	if (str) {
		return str.replace(/&[^;]+;/g, (match) => entities[match] || match);
	} else {
		return str;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Add Database Features
export function addFeatureGroupsFromDB(map, FGs) {
	// console.log('LETS ADD DB-FEATURES: ', FGs);

	// Loop through all FeatureGroups
	FGs.forEach((FG) => {
		// Load style, groupnames and features
		var style = JSON.parse(`{${decodeHtmlEntities(FG.style)}}`);
		var groupNames = JSON.parse(decodeHtmlEntities(FG.groupnames)); //!DEBUG groupNames vs. groupnames (it's a PostgreSQL issue!)
		var featureCollection = JSON.parse(decodeHtmlEntities(FG.geojson_string));
		featureCollection.features.forEach((feature, idx) => {
			featureCollection.features[idx].properties.title = decodeHtmlEntities(FG.title);
			featureCollection.features[idx].properties.description = decodeHtmlEntities(FG.description);
		});
		// Add Source
		const sourceId = `DBFeatureSource-${FG.id}`;
		map.addSource(sourceId, {
			type: 'geojson',
			data: featureCollection
		});
		// Add Layers
		featureCollection.features.forEach((feature, index) => {
			const layerId = `DBLayer-${FG.id}-${index + 1}`;
			addLayer(map, feature, sourceId, layerId, style, groupNames);
		});
	});
}
