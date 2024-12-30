import {addFeatureCollection} from './addFeatureCollection'

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
export function addFeatureGroupsFromDB(map, featColls) {
	// console.log('LETS ADD DB-FEATURES: ', featColls);

	// Loop through all FeatureGroups
	featColls.forEach((featColl) => {
		// Load style, groupnames and features
		
		var style = (featColl.style) ? JSON.parse(`{${decodeHtmlEntities(featColl.style)}}`) : undefined;
		var featColl = (featColl.geojson_string) ? JSON.parse(decodeHtmlEntities(featColl.geojson_string)) : undefined;
		
		featColl.features.forEach((feature, idx) => {
			featColl.features[idx].properties.title = decodeHtmlEntities(featColl.title);
			featColl.features[idx].properties.description = decodeHtmlEntities(featColl.description);
		});


		addFeatureCollection(map, featColl, {
			idCollector: undefined,
			sortByTypesArray: undefined,
			id: featColl.properties.id, //! LEGACY: in JWKarte the id was directly on featColl.id
			id_prefix: 'fromDB',
			manualStyleset: undefined,
			defaultStyleset: undefined,
			groups: (featColl.groups) ? JSON.parse(decodeHtmlEntities(featColl.groups)) : undefined, //!LEGACY: in JWKarte (Postgres-DB) the groups' key was named groupnames (not groups)
			allowDirectAccess: undefined
		});

	});
}
