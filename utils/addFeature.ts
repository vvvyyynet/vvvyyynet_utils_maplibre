import maplibregl from 'maplibre-gl';
import { addLayer } from './addLayer';
import { getValidValue } from './validateProperties';
import { tweakGlowStyle } from './tweakGlowStyle';
import { pushToNested, getNested, setNested } from './general_utils';

// import { validateStyleMin } from 'maplibre-gl';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function constructId(base, layerId) {
	return [base.prefix, layerId, base.postfix].filter(Boolean).join(base.sep);
}

function justPassOnValue(type, camelCaseName, value) {
	return value;
}

// Execute Callbacks on relevant nodes
function executeCallbacks(collCallbacks, map, layerId, paths: string[]) {
	paths.forEach((path) => {
		const fun = typeof getNested(collCallbacks, path);
		if (fun === 'function') fun(map, layerId);
	});
}

// Push to idCollector
function pushToIdCollector(idCollector, layerId, paths: string[]) {
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
		console.warn('Will skip validation');
		validationFunction = justPassOnValue;
	} else {
		console.warn('Wants to validate (not implemented yet!)');
		// validationFunction = getValidValue;
		// validationFunction = validateStyleMin;
	}

	// Slow version with output (only for debugging)
	const val1 = getNested(collStyleset, forcePath);
	const val2 = getNested(featStyleset, path);
	const val3 = getNested(featProps, path.split('.').pop()); // last element
	const val4 = getNested(collStyleset, path);
	const val5 = getNested(presetStyleset, path);

	// validation
	const validVal1 = validationFunction(validationPropPath, camelCaseName, val1);
	const validVal2 = validationFunction(
		validationPropPath,
		camelCaseName,
		getNested(featStyleset, path)
	);
	const validVal3 = validationFunction(validationPropPath, camelCaseName, val3); // last element
	const validVal4 = validationFunction(validationPropPath, camelCaseName, val4);
	const validVal5 = validationFunction(validationPropPath, camelCaseName, val5);

	// coalescing
	const returnvalue =
		validVal1 ??
		validVal2 ??
		(acceptTopLevelFeatureProps ? validVal3 : undefined) ??
		validVal4 ??
		validVal5;

	// Output
	if (path.split('.').pop() == 'lineWidth') {
		// if (true) {
		console.log('PATH: ', path);
		console.log('RETURN VALUE: ', returnvalue);
		console.log(`(1) collStyleset forced: ${validVal1} (${val1})`);
		console.log(`(2) featStyleset nested: ${validVal2} (${val2})`);
		console.log(`(3) featProps direct: ${validVal3} (${val3})`);
		console.log(`(4) collStyleset normal: ${validVal4} (${val4})`);
		console.log(`(5) presetStyleset: ${validVal5} (${val5})`);
	}
	return returnvalue;

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
			pointCircle: { prefix: 'pointCircle', postfix: '', sep: '-' },
			pointSymbol: { prefix: 'pointSymbol', postfix: '', sep: '-' },
			pointBackdropCircle: { prefix: 'pointBackdropCircle', postfix: '', sep: '-' },
			line: { prefix: 'line', postfix: '', sep: '-' },
			lineGlow: { prefix: 'lineGlow', postfix: '', sep: '-' },
			lineCornerCircle: { prefix: 'lineCornerCircle', postfix: '', sep: '-' },
			lineCornerSymbol: { prefix: 'lineCornerSymbol', postfix: '', sep: '-' },
			polygonFill: { prefix: 'polygonFill', postfix: '', sep: '-' },
			polygonContour: { prefix: 'polygonContour', postfix: '', sep: '-' },
			polygonContourGlow: { prefix: 'polygonContourGlow', postfix: '', sep: '-' },
			polygonCornerCircle: { prefix: 'polygonCornerCircle', postfix: '', sep: '-' },
			polygonCornerSymbol: { prefix: 'polygonCornerSymbol', postfix: '', sep: '-' }
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

	const layerId_PtC = constructId(idConstructors.pointCircle, layerId);
	const layerId_PtS = constructId(idConstructors.pointSymbol, layerId);
	const layerId_PtC_back = constructId(idConstructors.pointBackdropCircle, layerId);
	const layerId_LnL_reg = constructId(idConstructors.line, layerId);
	const layerId_LnL_glow = constructId(idConstructors.lineGlow, layerId);
	const layerId_LnC = constructId(idConstructors.lineCornerCircle, layerId);
	const layerId_LnS = constructId(idConstructors.lineCornerSymbol, layerId);
	const layerId_PgF = constructId(idConstructors.polygonFill, layerId);
	const layerId_PgL_reg = constructId(idConstructors.polygonContour, layerId);
	const layerId_PgL_glow = constructId(idConstructors.polygonContourGlow, layerId);
	const layerId_PgC = constructId(idConstructors.polygonCornerCircle, layerId);
	const layerId_PgS = constructId(idConstructors.polygonCornerSymbol, layerId);

	// ---------------------------------------------------------------------------------------
	// PATH LISTS FOR CALLBACKS
	// Points
	const pathsCB_Pt_base = ['all', 'points.all']; // helper
	const pathsCB_PtS = [...pathsCB_Pt_base, 'points.symbols'];
	const pathsCB_PtC = [...pathsCB_Pt_base, 'points.circles'];
	const pathsCB_PtC_back = [...pathsCB_Pt_base, 'points.backdropCircles'];

	// Lines
	const pathsCB_Ln_base = ['all', 'lines.all']; // helper
	const pathsCB_Ln_points = [pathsCB_Ln_base, 'lines.corners.all']; // helper
	const pathsCB_LnC = [...pathsCB_Ln_points, 'lines.corners.circles'];
	const pathsCB_LnS = [...pathsCB_Ln_points, 'lines.corners.symbols'];
	const pathsCB_Ln_lines = [...pathsCB_Ln_base, 'lines.contours.all']; // helper
	const pathsCB_LnL_reg = [...pathsCB_Ln_lines, 'lines.contours.reg'];
	const pathsCB_LnL_glow = [...pathsCB_Ln_lines, 'lines.contours.glow'];

	// Polygons
	const pathsCB_Pg_base = ['all', 'polygons.all']; // helper
	const pathsCB_Pg_points = [pathsCB_Pg_base, 'polygons.corners.all']; // helper
	const pathsCB_PgC = [...pathsCB_Pg_points, 'polygons.corners.circles'];
	const pathsCB_PgS = [...pathsCB_Pg_points, 'polygons.corners.symbols'];
	const pathsCB_Pg_lines = [...pathsCB_Pg_base, 'polygons.contours.all']; // helper
	const pathsCB_PgL_reg = [...pathsCB_Pg_lines, 'polygons.contours.reg'];
	const pathsCB_PgL_glow = [...pathsCB_Pg_lines, 'polygons.contours.glow'];
	const pathsCB_PgF = [...pathsCB_Pg_base, 'polygons.fill'];

	// ---------------------------------------------------------------------------------------
	// PATH LISTS FOR IdCollector
	// Points
	const pathsID_PtS = pathsCB_PtS; 
	const pathsID_PtC = pathsCB_PtC; 
	const pathsID_PtC_back = pathsCB_PtC_back; 

	// Lines
	const pathsID_LnC = pathsCB_LnC; 
	const pathsID_LnS = pathsCB_LnS; 
	const pathsID_LnL_reg = pathsCB_LnL_reg; 
	const pathsID_LnL_glow = pathsCB_LnL_glow; 

	// Polygons
	const pathsID_PgC = pathsCB_PgC; 
	const pathsID_PgS = pathsCB_PgS; 
	const pathsID_PgL_reg = pathsCB_PgL_reg; 
	const pathsID_PgL_glow = pathsCB_PgL_glow; 
	const pathsID_PgF = pathsCB_PgF; 

	// ---------------------------------------------------------------------------------------
	// CHECK FEATURE TYPE
	const featureType = feature?.geometry?.type;

	// ---------------------------------------------------------------------------------------
	// RE-DEFINE COALESCE FUNCTION
	// console.log('SKIPVALIDATION (addFeature): ', skipValidation);
	// like so c(path) only requires path, whereas the other function arguments are taken from addFeature's arguments
	function c(stylesetPath, camelCaseName, validationPropPath, { forceSkipValidation = undefined }) {
		// console.log('SKIPVALIDATION (c): ', skipValidation);
		return coalesce(
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
	}

	// ---------------------------------------------------------------------------------------
	// Add Layer

	// =======================================================================================
	if (featureType === 'MultiPoint' || featureType === 'Point') {
		// =====================================================================================
		// --------------------------------------
		// Points - Points as Circles
		// --------------------------------------
		if (c('points', 'addCircles', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'circle', c, 'points');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PtC, pathsCB_PtC, pathsID_PtC);
		}

		// --------------------------------------
		// Points - Points as Symbols (Backdrops)
		// --------------------------------------
		if (c('points', 'addBackdropCircles', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(
					map,
					layerId,
					sourceId,
					groupNames,
					filterId,
					'circle',
					c,
					'points.backdropCircle'
				);
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PtC_back, pathsCB_PtC_back, pathsID_PtC_back);
		}

		// --------------------------------------
		// Points - Points as Symbols
		// --------------------------------------
		if (c('points', 'addSymbols', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'symbol', c, 'points');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PtS, pathsCB_PtS, pathsID_PtS);
		}

		// =====================================================================================
	} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
		// =====================================================================================
		// --------------------------------------
		// Lines - Glow Lines
		// --------------------------------------
		if (c('lines', 'addGlow', null, { forceSkipValidation: true })) {
			// Tweak lineWidth for glow in all stylesets
			collStyleset = tweakGlowStyle(collStyleset, 'lines');
			collStyleset.force = tweakGlowStyle(collStyleset.force, 'lines');
			featStyleset = tweakGlowStyle(featStyleset, 'lines');
			presetStyleset = tweakGlowStyle(presetStyleset, 'lines');

			// Add Layer and execute callbacks
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'line', c, 'lines.glow');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_LnL_glow, pathsCB_LnL_glow, pathsID_LnL_glow);
		}

		// --------------------------------------
		// Lines - Regular Lines
		// --------------------------------------
		((layerId, pathList_cb, pathList_idColl) => {
			map = addLayer(map, layerId, sourceId, groupNames, filterId, 'line', c, 'lines');
			executeCallbacks(collCallbacks, map, layerId, pathList_cb);
			pushToIdCollector(idCollector, layerId, pathList_idColl);
		})(layerId_LnL_reg, pathsCB_LnL_reg, pathsID_LnL_reg);

		// --------------------------------------
		// Lines - Corners as Circles
		// --------------------------------------
		if (c('lines', 'addCircles', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'circle', c, 'lines');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_LnC, pathsCB_LnC, pathsID_LnC);
		}
		// --------------------------------------
		// Lines - Corners as Symbols
		// --------------------------------------
		if (c('lines', 'addSymbols', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'symbol', c, 'lines');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_LnS, pathsCB_LnS, pathsID_LnS);
		}

		// =====================================================================================
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// =====================================================================================
		// --------------------------------------
		// Polygons - Filling
		// --------------------------------------
		((layerId, pathList_cb, pathList_idColl) => {
			map = addLayer(map, layerId, sourceId, groupNames, filterId, 'fill', c, 'polygons');
			executeCallbacks(collCallbacks, map, layerId, pathList_cb);
			pushToIdCollector(idCollector, layerId, pathList_idColl);
		})(layerId_PgF, pathsCB_PgF, pathsID_PgF);

		// --------------------------------------
		// Polygons - Contours Glow
		// --------------------------------------
		if (c('polygons', 'addGlow', null, { forceSkipValidation: true })) {
			// Tweak lineWidth for glow in all stylesets
			collStyleset = tweakGlowStyle(collStyleset, 'polygons');
			collStyleset.force = tweakGlowStyle(collStyleset.force, 'polygons');
			featStyleset = tweakGlowStyle(featStyleset, 'polygons');
			presetStyleset = tweakGlowStyle(presetStyleset, 'polygons');

			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'line', c, 'polygons');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PgL_glow, pathsCB_PgL_glow, pathsID_PgL_glow);
		}

		// --------------------------------------
		// Polygons - Contours Regular
		// --------------------------------------
		((layerId, pathList_cb, pathList_idColl) => {
			map = addLayer(map, layerId, sourceId, groupNames, filterId, 'line', c, 'polygons');
			executeCallbacks(collCallbacks, map, layerId, pathList_cb);
			pushToIdCollector(idCollector, layerId, pathList_idColl);
		})(layerId_PgL_reg, pathsCB_PgL_reg, pathsID_PgL_reg);

		// --------------------------------------
		// Polygons - Corners as Circles
		// --------------------------------------
		if (c('polygons', 'addCircle', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'circle', c, 'polygons');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PgC, pathsCB_PgC, pathsID_PgC);
		}

		// --------------------------------------
		// Polygons - Corners as Symbols
		// --------------------------------------
		if (c('polygons', 'addCircle', null, { forceSkipValidation: true })) {
			((layerId, pathList_cb, pathList_idColl) => {
				map = addLayer(map, layerId, sourceId, groupNames, filterId, 'symbol', c, 'polygons');
				executeCallbacks(collCallbacks, map, layerId, pathList_cb);
				pushToIdCollector(idCollector, layerId, pathList_idColl);
			})(layerId_PgS, pathsCB_PgS, pathsID_PgS);
		}
		// =====================================================================================
	} else if (feature.properties.shape === 'GeometryCollection') {
		// =====================================================================================
		// --------------------------------------
		// Geometry Collection
		// --------------------------------------
		//! undecided yet, what to do with them.
	}

	return { map: map, idCollector: idCollector };
}
