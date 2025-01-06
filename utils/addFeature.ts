import maplibregl from 'maplibre-gl';
import { addLayer } from './addLayer';
import { getValidValue } from './validateProperties';
import { tweakGlowStyle } from './tweakGlowStyle';
import { pushToNested, getNested, setNested } from './general_utils';

// import { validateStyleMin } from 'maplibre-gl';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function justPassOnValue(type, camelCaseName, value) {
	return value;
}

// Execute Callbacks on relevant nodes
// The following variables will be exposed to the function:
// - map
// - layerType
// - stylesetPath
// - layerId
// - pathsID
// - (c)
// - (pushToIdCollector)
// - (collStyleset)
// - (featStyleset)
// - (presetStyleset)

function executeCallbacks(
	collCallbacks: object,
	pathsCB: string[],
	map: object,
	layerType: string,
	stylesetPath: string,
	layerId: string,
	pathsID: string[],
	{
		c = undefined,
		pushToIdCollector = undefined,
		idCollector = undefined,
		addLayer = undefined,
		executeCallbacks = undefined,
		collStyleset = undefined,
		featStyleset = undefined,
		presetStyleset = undefined,
		sourceId = undefined,
		groupNames = undefined,
		filterId = undefined
	}
) {
	pathsCB.forEach((path) => {
		const fun = getNested(collCallbacks, path);
		if (typeof fun === 'function') {
			// Run the callback function
			const result = fun(map, layerType, stylesetPath, layerId, pathsID, {
				c: c,
				pushToIdCollector: pushToIdCollector,
				idCollector: idCollector,
				addLayer: addLayer,
				executeCallbacks: executeCallbacks,
				collStyleset: collStyleset,
				featStyleset: featStyleset,
				presetStyleset: presetStyleset,
				sourceId: sourceId,
				groupNames: groupNames,
				filterId: filterId,
				pathsCB: pathsCB
			});
			// If result contains one of the following keys, overwrite it. Otherwise return the unchanged input arguments
			map = result?.map ?? map;
			layerType = result?.layerType ?? layerType;
			stylesetPath = result?.stylesetPath ?? stylesetPath;
			layerId = result?.layerId ?? layerId;
			pathsID = result?.pathsID ?? pathsID;
		}
	});
	return {
		map: map,
		layerType: layerType,
		stylesetPath: stylesetPath,
		layerId: layerId,
		pathsID: pathsID
	};
}

// Push to idCollector
function pushToIdCollector(idCollector: object, layerId: string, paths: string[]) {
	paths.forEach((path) => {
		pushToNested(idCollector, path, layerId);
	});
}

// Coalescing with styleset-level validation
function coalesce(
	featProps,
	collStyleset,
	featStyleset,
	presetStyleset,
	stylesetPath,
	camelCaseName,
	validationPropPath,
	acceptTopLevelFeatureProps,
	{ skipValidation = false }
) {
	// console.log('SKIPVALIDATION (coalesce): ', skipValidation);
	const path = `${stylesetPath}.${camelCaseName}`;
	const forcePath = `force.${path}`;

	// Make it possible to skip validation
	let validationFunction;
	if (skipValidation) {
		// console.log('Will skip validation');
		validationFunction = justPassOnValue;
	} else {
		// console.log('Wants to validate (not implemented yet!)');
		// validationFunction = getValidValue;
		// validationFunction = validateStyleMin;
	}

	// Slow version with output (only for debugging)
	// const val1 = getNested(collStyleset, forcePath);
	// const val2 = getNested(featStyleset, path);
	// const val3 = getNested(featProps, path.split('.').pop()); // last element
	// const val4 = getNested(collStyleset, path);
	// const val5 = getNested(presetStyleset, path);

	// // validation
	// const validVal1 = validationFunction(validationPropPath, camelCaseName, val1);
	// const validVal2 = validationFunction(
	// 	validationPropPath,
	// 	camelCaseName,
	// 	getNested(featStyleset, path)
	// );
	// const validVal3 = validationFunction(validationPropPath, camelCaseName, val3); // last element
	// const validVal4 = validationFunction(validationPropPath, camelCaseName, val4);
	// const validVal5 = validationFunction(validationPropPath, camelCaseName, val5);

	// // coalescing
	// const returnvalue =
	// 	validVal1 ??
	// 	validVal2 ??
	// 	(acceptTopLevelFeatureProps ? validVal3 : undefined) ??
	// 	validVal4 ??
	// 	validVal5;

	// // Output
	// if (path.split('.').pop() == 'addBackdropCircles') {
	// 	// if (true) {
	// 	console.log('PATH: ', path);
	// 	console.log('RETURN VALUE: ', returnvalue);
	// 	console.log(`(1) collStyleset forced: ${validVal1} (${val1})`);
	// 	console.log(`(2) featStyleset nested: ${validVal2} (${val2})`);
	// 	console.log(`(3) featProps direct: ${validVal3} (${val3})`);
	// 	console.log(`(4) collStyleset normal: ${validVal4} (${val4})`);
	// 	console.log(`(5) presetStyleset: ${validVal5} (${val5})`);
	// }
	// return returnvalue;

	// Fast version (will stop calculating as soon as non-nullish value is found)
	return (
		validationFunction(validationPropPath, camelCaseName, getNested(collStyleset, forcePath)) ??
		validationFunction(validationPropPath, camelCaseName, getNested(featStyleset, path)) ??
		(acceptTopLevelFeatureProps
			? validationFunction(
					validationPropPath,
					camelCaseName,
					getNested(featProps, path.split('.').pop())
				)
			: undefined) ??
		validationFunction(validationPropPath, camelCaseName, getNested(collStyleset, path)) ??
		validationFunction(validationPropPath, camelCaseName, getNested(presetStyleset, path))
	);
}

function constructId(base, layerId) {
	return [base.prefix, layerId, base.postfix].filter(Boolean).join(base.sep);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Add Feature
//////////////////////////////////////////////////////////////////////////////////////////
export function addFeature(
	map,
	feature,
	sourceId,
	layerId,
	{
		groupNames = [],
		collCallbacks = {},
		collStyleset = {}, // manual styling
		featStyleset = {}, // styling as read from geoJSON
		idCollector = {},
		acceptTopLevelFeatureProps = false,
		presetStyleset = {},
		idConstructors = {
			PtC: { prefix: 'PointCircles', postfix: '', sep: '-' },
			PtS: { prefix: 'PointSymbols', postfix: '', sep: '-' },
			PtC_back: { prefix: 'PointCircles_backdrop', postfix: '', sep: '-' },
			LnLreg: { prefix: 'Line', postfix: '', sep: '-' },
			LnLglow: { prefix: 'LineGlow', postfix: '', sep: '-' },
			LnC: { prefix: 'LineCircles', postfix: '', sep: '-' },
			LnS: { prefix: 'LineSymbols', postfix: '', sep: '-' },
			PgF: { prefix: 'PolygonFills', postfix: '', sep: '-' },
			PgLreg: { prefix: 'PolygonLines', postfix: '', sep: '-' },
			PgLglow: { prefix: 'PolygonLines_glow', postfix: '', sep: '-' },
			PgC: { prefix: 'PolygonCircles', postfix: '', sep: '-' },
			PGS: { prefix: 'PolygonSymbols', postfix: '', sep: '-' }
		},
		skipValidation = undefined
	}
) {
	// ---------------------------------------------------------------------------------------
	// CHECKS
	// Test for missing layerId
	if (!layerId) {
		console.warn('missing layerId detected: ', feature);
		return;
	}

	// Test for nullis feature
	if (!feature) {
		console.warn('nullish feature detected: ', layerId, feature);
		return;
	}

	// Test for missing feature.properties.id
	if (!feature?.properties?.id) {
		console.warn(
			'missing id detected (please make sure, a unique id is set on feature.properties.id): ',
			layerId,
			feature
		);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// CONSTRUCT IDs
	const filterId = feature.properties.id;

	const layerId_PtC = constructId(idConstructors.PtC, layerId);
	const layerId_PtS = constructId(idConstructors.PtS, layerId);
	const layerId_LnL = constructId(idConstructors.LnLreg, layerId);
	const layerId_LnC = constructId(idConstructors.LnC, layerId);
	const layerId_LnS = constructId(idConstructors.LnS, layerId);
	const layerId_PgF = constructId(idConstructors.PgF, layerId);
	const layerId_PgL = constructId(idConstructors.PgLreg, layerId);
	const layerId_PgC = constructId(idConstructors.PgC, layerId);
	const layerId_PgS = constructId(idConstructors.PGS, layerId);

	// ---------------------------------------------------------------------------------------
	// PATH LISTS FOR CALLBACKS
	// Points
	const pathsCB_Pt_base = ['all', 'points', 'points.all']; // helper
	const pathsCB_PtS = [...pathsCB_Pt_base, 'points.symbols'];
	const pathsCB_PtC = [...pathsCB_Pt_base, 'points.circles'];

	// Lines
	const pathsCB_Ln_base = ['all', 'lines', 'lines.all']; // helper
	const pathsCB_Ln_points = [...pathsCB_Ln_base, 'lines.points.all']; // helper
	const pathsCB_LnC = [...pathsCB_Ln_points, 'lines.points.circles'];
	const pathsCB_LnS = [...pathsCB_Ln_points, 'lines.points.symbols'];
	const pathsCB_LnL = [...pathsCB_Ln_base, 'lines.lines']; // helper

	// Polygons
	const pathsCB_Pg_base = ['all', 'polygons', 'polygons.all']; // helper
	const pathsCB_Pg_points = [...pathsCB_Pg_base, 'polygons.points.all']; // helper
	const pathsCB_PgC = [...pathsCB_Pg_points, 'polygons.points.circles'];
	const pathsCB_PgS = [...pathsCB_Pg_points, 'polygons.points.symbols'];
	const pathsCB_PgL = [...pathsCB_Pg_base, 'polygons.lines'];
	const pathsCB_PgF = [...pathsCB_Pg_base, 'polygons.fill'];

	// ---------------------------------------------------------------------------------------
	// PATH LISTS FOR IdCollector
	// Points
	const pathsID_Pt_base = ['all', 'points.all']; // helper
	const pathsID_PtS = [...pathsID_Pt_base, 'points.symbols'];
	const pathsID_PtC = [...pathsID_Pt_base, 'points.circles'];

	// Lines
	const pathsID_Ln_base = ['all', 'lines.all']; // helper
	const pathsID_Ln_points = [...pathsID_Ln_base, 'lines.points.all']; // helper
	const pathsID_LnC = [...pathsID_Ln_points, 'lines.points.circles'];
	const pathsID_LnS = [...pathsID_Ln_points, 'lines.points.symbols'];
	const pathsID_LnL = [...pathsID_Ln_base, 'lines.lines']; // helper

	// Polygons
	const pathsID_Pg_base = ['all', 'polygons.all']; // helper
	const pathsID_Pg_points = [...pathsID_Pg_base, 'polygons.points.all']; // helper
	const pathsID_PgC = [...pathsID_Pg_points, 'polygons.points.circles'];
	const pathsID_PgS = [...pathsID_Pg_points, 'polygons.points.symbols'];
	const pathsID_PgL = [...pathsID_Pg_base, 'polygons.lines'];
	const pathsID_PgF = [...pathsID_Pg_base, 'polygons.fill'];

	// ---------------------------------------------------------------------------------------
	// PAIRS
	const pairs_point = [
		['circle', 'points', layerId_PtC, pathsCB_PtC, pathsID_PtC],
		['symbol', 'points', layerId_PtS, pathsCB_PtS, pathsID_PtS]
	];
	const pairs_line = [
		['line', 'lines', layerId_LnL, pathsCB_LnL, pathsID_LnL],
		['circle', 'lines', layerId_LnC, pathsCB_LnC, pathsID_LnC],
		['symbol', 'lines', layerId_LnS, pathsCB_LnS, pathsID_LnS]
	];
	const pairs_polygon = [
		['fill', 'polygons', layerId_PgF, pathsCB_PgF, pathsID_PgF],
		['line', 'polygons', layerId_PgL, pathsCB_PgL, pathsID_PgL],
		['circle', 'polygons', layerId_PgC, pathsCB_PgC, pathsID_PgC],
		['symbol', 'polygons', layerId_PgS, pathsCB_PgS, pathsID_PgS]
	];

	// ---------------------------------------------------------------------------------------
	// CHECK FEATURE TYPE
	const featureType = feature?.geometry?.type;

	// ---------------------------------------------------------------------------------------
	// RE-DEFINE COALESCE FUNCTION
	// console.log('SKIPVALIDATION (addFeature): ', skipValidation);
	// like so c(path) only requires path, whereas the other function arguments are taken from addFeature's arguments
	function c(stylesetPath, camelCaseName, validationPropPath, { forceSkipValidation = undefined }) {
		const result = coalesce(
			feature?.properties,
			collStyleset,
			featStyleset,
			presetStyleset,
			stylesetPath,
			camelCaseName,
			validationPropPath,
			acceptTopLevelFeatureProps,
			{ skipValidation: forceSkipValidation != undefined ? forceSkipValidation : skipValidation }
		);
		// console.log('coalesce: ', result);
		return result;
	}

	// ---------------------------------------------------------------------------------------
	// Add Layer

	let pairs: any[];
	if (featureType == 'Point') pairs = pairs_point;
	else if (featureType == 'MultiPoint') pairs = pairs_point;
	else if (featureType == 'LineString') pairs = pairs_line;
	else if (featureType == 'MultiLineString') pairs = pairs_polygon;
	else if (featureType == 'Polygon') pairs = pairs_polygon;
	else if (featureType == 'GeometryCollection') pairs = [];
	else pairs = [];

	pairs.forEach((pair) => {
		let layerType = pair[0];
		let stylesetPath = pair[1];
		let layerId = pair[2];
		let pathsCB = pair[3];
		let pathsID = pair[4];

		// Execute Callback (pre-adding)
		({ map, layerType, stylesetPath, layerId, pathsID } = executeCallbacks(
			collCallbacks,
			pathsCB.map((path) => `${path}.pre`),
			map,
			layerType,
			stylesetPath,
			layerId,
			pathsID,
			{
				c: c,
				pushToIdCollector: pushToIdCollector,
				idCollector: idCollector,
				addLayer: addLayer,
				executeCallbacks: executeCallbacks,
				collStyleset: collStyleset,
				featStyleset: featStyleset,
				presetStyleset: presetStyleset,
				sourceId: sourceId,
				groupNames: groupNames,
				filterId: filterId,
				pathsCB: pathsCB
			}
		));

		// Add Layer
		map = addLayer(map, layerId, sourceId, groupNames, filterId, layerType, c, stylesetPath);

		// Execute Callback (post-adding)
		({ map, layerType, stylesetPath, layerId, pathsID } = executeCallbacks(
			collCallbacks,
			pathsCB.map((path) => `${path}.post`),
			map,
			layerType,
			stylesetPath,
			layerId,
			pathsID,
			{ c: c, pushToIdCollector: pushToIdCollector }
		));
		// Collect layerId
		pushToIdCollector(idCollector, layerId, pathsID);
	});

	return { map: map, idCollector: idCollector };
}
