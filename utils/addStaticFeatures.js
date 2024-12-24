// Add Static Features
export function addStaticFeatures(map, staticURLs) {
	// Loop through all staticURLs
	staticURLs.forEach(async (staticURL) => {
		// Fetch geoJSON from static URL
		try {
			const FG_geojson = await fetch(staticURL);
			const FG = await FG_geojson.json();

			// Load style, groupnames and features
			var style = FG.properties.style;
			var groupNames = null; //FG.properties.groupNames; // must be passed down to individual features in layers!
			var features = FG.features;

			// Add Source
			const sourceId = `staticFeatureSource-${FG.properties.id}`;
			if (!map.getSource(sourceId)) {
				// only add source if not already exist (will solve HMR errors)
				map.addSource(sourceId, {
					type: 'geojson',
					data: FG
				});
			}

			// Add Layers
			features.forEach((feature, index) => {
				const layerId = `staticLayer-${FG.properties.id}-${index + 1}`;
				const groupNames = feature.metadata?.groupNames || [];
				const has_glow = feature.metadata?.has_glow || false;
				// console.log(layerId, FG, style);
				addLayer(map, feature, sourceId, layerId, style, groupNames, has_glow);
			});
		} catch (error) {
			console.warn(error);
		}
	});
}
