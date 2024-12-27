import {addFeatures} from './addFeatures'

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
export function addFeatureGroupsFromDB(map, FeatColls) {
	// console.log('LETS ADD DB-FEATURES: ', FeatColls);

	// Loop through all FeatureGroups
	FeatColls.forEach((FeatColl) => {
		// Load style, groupnames and features
		
		var style = (FeatColl.style) ? JSON.parse(`{${decodeHtmlEntities(FeatColl.style)}}`) : undefined;
		var groupNames = (FeatColl.groupnames) ? JSON.parse(decodeHtmlEntities(FeatColl.groupnames)) : undefined; //!BEWARE groupNames vs. groupnames (unfortunately, I set up PostgreSQL with unquoted identifiers, so it is caseinsensitive!!)
		var featureCollection = (FeatColl.geojson_string) ? JSON.parse(decodeHtmlEntities(FeatColl.geojson_string)) : undefined;
		
		featureCollection.features.forEach((feature, idx) => {
			featureCollection.features[idx].properties.title = decodeHtmlEntities(FeatColl.title);
			featureCollection.features[idx].properties.description = decodeHtmlEntities(FeatColl.description);
		});

		addFeatures(map, featureCollection, {id: FeatColl.id, prefix: 'fromDB', groupNames: groupNames, style: FeatColl.properties.style }); 
	});
}
