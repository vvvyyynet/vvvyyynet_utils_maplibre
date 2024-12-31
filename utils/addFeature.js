import maplibregl from 'maplibre-gl';
import { addLayer } from './addLayer';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function constructId(base, layerId) {
	return [base.prefix, layerId, base.postfix].filter(Boolean).join(base.sep);
}

function setAtPath(object, path, value) {
	return path.split('.').reduce((acc, key, idx, arr) => {
		// Ensure the intermediate keys are objects or arrays
		if (idx < arr.length - 1 && acc[key] !== undefined && typeof acc[key] !== 'object') {
			console.warn(
				`Prevented from overwriting ${path} at '${arr
					.slice(0, idx + 1)
					.join('.')}' because the value is not an object (value is ${typeof acc[key]})`
			);
			return acc; // Exit early without changing the object
		}

		// Initialize the key as an empty object if it's the intermediate part of the path
		acc[key] = idx === arr.length - 1 ? value : acc[key] || {};

		return acc[key]; // Continue with the next level of the path
	}, object);
}

export function pushToPath(object, path, value) {
	return path.split('.').reduce((acc, key, idx, arr) => {
		// Case 1: If it's the final key (end of the path)
		if (idx === arr.length - 1) {
			// If the current key's value is not an array, ensure it's an array and push the value
			if (Array.isArray(acc[key])) {
				// If it's already an array, push the value
				acc[key].push(value);
			} else if (!acc[key]) {
				// If it's falsy
				acc[key] = [value];
			} else {
				// If it's a primitive (string, number, etc.), do not modify it
				console.warn(
					`Expected an array at '${arr.join('.')}', found: ${acc[key]}. Continued without changes.`
				);
				return acc; // Early exit without making changes
			}
		} else if (idx < arr.length - 1) {
			// Case 2: Ensure intermediate keys are objects and create them if necessary
			acc[key] = acc[key] || {};
		}

		return acc[key]; // Continue navigating through the path
	}, object);
}

function getNestedProperty(base, path) {
	return path.split('.').reduce((obj, key) => {
		return obj?.[key];
	}, base);
}

function coalesce(
	featProps,
	collStyleset,
	featStyleset,
	presetStyleset,
	path,
	acceptTopLevelFeatureProps
) {
	const forcePath = `force.${path}`;

	// Slow version with output (only for debugging)
	// const val1 = getNestedProperty(collStyleset, forcePath);
	// const val2 = getNestedProperty(featStyleset, path);
	// const val3 = getNestedProperty(featProps, path.split('.').pop()); // last element
	// const val4 = getNestedProperty(collStyleset, path);
	// const val5 = getNestedProperty(presetStyleset, path);
	// const returnvalue =
	// 	val1 || val2 || (acceptTopLevelFeatureProps ? val3 : undefined) || val4 || val5;
	// // if (path.split('.').pop() == 'lineDashArray') {
	// if (true) {
	// 	console.log('path', path);
	// 	console.log('collStyleset forced: ', val1);
	// 	console.log('featStyleset nested: ', val2);
	// 	console.log('featProps direct: ', val3);
	// 	console.log('collStyleset normal: ', val4);
	// 	console.log('presetStyleset: ', val5);
	// 	console.log(path, returnvalue);
	// }
	// return returnvalue;

	// Fast version (will stop calculating as soon as truthy value is found)
	return (
		getNestedProperty(collStyleset, forcePath) ||
		getNestedProperty(featStyleset, path) ||
		(acceptTopLevelFeatureProps
			? getNestedProperty(featProps, path.split('.').pop())
			: undefined) ||
		getNestedProperty(collStyleset, path) ||
		getNestedProperty(presetStyleset, path)
	);
}

function tweakGlowStyle(styleset, type) {
	// All replacements will happen on a styleset level.
	// Input: type = 'lines' or 'polygons'

	// ----------------------
	// lineCap and lineJoin
	// ----------------------
	// If glow.lineCap (glow.lineJoin) is unset, make sure they have the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.glow?.lineJoin) {
		// (testing for styleset?.[type]) is important, if styleset={})
		setAtPath(styleset?.[type], 'glow.lineJoin', styleset?.[type]?.lineJoin);
	}
	if (styleset?.[type] && !styleset?.[type]?.glow?.lineCap) {
		setAtPath(styleset?.[type], 'glow.lineCap', styleset?.[type]?.lineCap);
	}

	// ----------------------
	// lineWidth
	// ----------------------
	// Multiply the lineWidth of glow in a styleset by the lineWidthGlowFactor in the same styleset
	// only overwrite, if lineWidth is not set manually
	if (!styleset?.[type]?.glow?.lineWidth) {
		// try-catch makes it easier to escape non-existing style-paths or invalid values (e.g. multiplication by a String etc.)
		try {
			let lineWidth = JSON.parse(JSON.stringify(styleset[type])).lineWidth; // Deep copy

			if (typeof lineWidth == 'number') {
				setAtPath(
					styleset?.[type],
					'glow.lineWidth',
					styleset?.[type].lineWidth * styleset?.[type].glow.lineWidthGlowFactor
				);
			} else if (Array.isArray(lineWidth) && lineWidth[0] === 'interpolate') {
				// Indices to multiply: 4, 6, 8, 10, ...
				for (let i = 0; i < lineWidth.length; i++) {
					if (i >= 4 && i % 2 === 0) {
						lineWidth[i] *= styleset?.[type].glow.lineWidthGlowFactor;
					}
				}
				setAtPath(styleset?.[type], 'glow.lineWidth', lineWidth);
			}
		} catch (error) {
			// console.warn(error);
		}
	}
	return styleset;
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
		groups = [],
		featStyleset = {}, // styling as read from geoJSON
		collStyleset = {}, // manual styling
		idCollector = {},
		acceptTopLevelFeatureProps = false, //! TODO: implement
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
		}
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

	const layerId_pointCircle = constructId(idConstructors.pointCircle, layerId);
	const layerId_pointSymbol = constructId(idConstructors.pointSymbol, layerId);
	const layerId_pointBackdropCircle = constructId(idConstructors.pointBackdropCircle, layerId);
	const layerId_line = constructId(idConstructors.line, layerId);
	const layerId_lineGlow = constructId(idConstructors.lineGlow, layerId);
	const layerId_lineCornerCircle = constructId(idConstructors.lineCornerCircle, layerId);
	const layerId_lineCornerSymbol = constructId(idConstructors.lineCornerSymbol, layerId);
	const layerId_polygonFill = constructId(idConstructors.polygonFill, layerId);
	const layerId_polygonContour = constructId(idConstructors.polygonContour, layerId);
	const layerId_polygonContourGlow = constructId(idConstructors.polygonContourGlow, layerId);
	const layerId_polygonCornerCircle = constructId(idConstructors.polygonCornerCircle, layerId);
	const layerId_polygonCornerSymbol = constructId(idConstructors.polygonCornerSymbol, layerId);

	// ---------------------------------------------------------------------------------------
	// CHECK FEATURE TYPE
	const featureType = feature?.geometry?.type;

	// ---------------------------------------------------------------------------------------
	// RE-DEFINE COALESCE FUNCTION
	function c(path) {
		return coalesce(
			feature?.properties,
			collStyleset,
			featStyleset,
			presetStyleset,
			path,
			acceptTopLevelFeatureProps
		);
	}

	// ---------------------------------------------------------------------------------------
	// ADD LAYER

	// =======================================================================================
	if (featureType === 'MultiPoint' || featureType === 'Point') {
		// =====================================================================================
		switch (c('points.type')) {
			// --------------------------------------
			// Points - Points as Circles
			// --------------------------------------
			case 'circle':
				map = addLayer(
					map,
					layerId_pointCircle,
					sourceId,
					groups,
					filterId,
					'circle',
					c,
					'points.circle'
				);
				// Push to idCollector
				pushToPath(idCollector, 'all', layerId_pointCircle);
				pushToPath(idCollector, 'types.points.all', layerId_pointCircle);
				pushToPath(idCollector, 'types.points.circles', layerId_pointCircle);
				pushToPath(idCollector, 'shapes.circles', layerId_pointCircle);
				break;

			case 'symbol':
				// --------------------------------------
				// Points - Points as Symbols (Backdrops)
				// --------------------------------------
				if (c('points.symbol.hasBackdropCircle')) {
					map = addLayer(
						map,
						layerId_pointBackdropCircle,
						sourceId,
						groups,
						filterId,
						'circle',
						c,
						'points.symbol.backdropCircle'
					);
					// Push to idCollector
					pushToPath(idCollector, 'all', layerId_pointBackdropCircle);
					pushToPath(idCollector, 'types.points.all', layerId_pointBackdropCircle);
					pushToPath(idCollector, 'types.points.backdropCircles', layerId_pointBackdropCircle);
					pushToPath(idCollector, 'shapes.special.backdropCircles', layerId_pointBackdropCircle);
				}

				// --------------------------------------
				// Points - Points as Symbols
				// --------------------------------------
				map = addLayer(
					map,
					layerId_pointSymbol,
					sourceId,
					groups,
					filterId,
					'symbol',
					c,
					'points.symbol'
				);
				// Push to idCollector
				pushToPath(idCollector, 'all', layerId_pointSymbol);
				pushToPath(idCollector, 'types.points.all', layerId_pointSymbol);
				pushToPath(idCollector, 'types.points.symbols', layerId_pointSymbol);
				pushToPath(idCollector, 'shapes.symbols', layerId_pointSymbol);

				break;
		}

		// =====================================================================================
	} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
		// =====================================================================================
		// --------------------------------------
		// Lines - Glow Lines
		// --------------------------------------
		if (c('lines.hasGlow')) {
			// Tweak lineWidth for glow in all stylesets
			collStyleset = tweakGlowStyle(collStyleset, 'lines');
			collStyleset.force = tweakGlowStyle(collStyleset.force, 'lines');
			featStyleset = tweakGlowStyle(featStyleset, 'lines');
			presetStyleset = tweakGlowStyle(presetStyleset, 'lines');

			map = addLayer(map, layerId_lineGlow, sourceId, groups, filterId, 'line', c, 'lines.glow');

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId_lineGlow);
			pushToPath(idCollector, 'types.lines.all', layerId_lineGlow);
			pushToPath(idCollector, 'types.lines.lines.all', layerId_lineGlow);
			pushToPath(idCollector, 'types.lines.lines.glows', layerId_lineGlow);
			pushToPath(idCollector, 'shapes.special.lineGlows', layerId_lineGlow);
		}

		// --------------------------------------
		// Lines - Regular Lines
		// --------------------------------------
		map = addLayer(map, layerId_line, sourceId, groups, filterId, 'line', c, 'lines');
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_line);
		pushToPath(idCollector, 'types.lines.all', layerId_line);
		pushToPath(idCollector, 'types.lines.lines.all', layerId_line);
		pushToPath(idCollector, 'shapes.lines', layerId_line);

		// --------------------------------------
		// Lines - Corners as Circles
		// --------------------------------------
		map = addLayer(map, layerId_lineCornerCircle, sourceId, groups, filterId, 'circle', c, 'lines');
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_lineCornerCircle);
		pushToPath(idCollector, 'types.lines.all', layerId_lineCornerCircle);
		pushToPath(idCollector, 'types.lines.corners.all', layerId_lineCornerCircle);
		pushToPath(idCollector, 'types.lines.corners.circles', layerId_lineCornerCircle);
		pushToPath(idCollector, 'shapes.circles', layerId_lineCornerCircle);

		// --------------------------------------
		// Lines - Corners as Symbols
		// --------------------------------------
		map = addLayer(map, layerId_lineCornerSymbol, sourceId, groups, filterId, 'symbol', c, 'lines');
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_lineCornerSymbol);
		pushToPath(idCollector, 'types.lines.all', layerId_lineCornerSymbol);
		pushToPath(idCollector, 'types.lines.corners.all', layerId_lineCornerSymbol);
		pushToPath(idCollector, 'types.lines.corners.symbols', layerId_lineCornerSymbol);
		pushToPath(idCollector, 'shapes.symbols', layerId_lineCornerSymbol);

		// =====================================================================================
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// =====================================================================================
		// --------------------------------------
		// Polygons - Filling
		// --------------------------------------
		map = addLayer(map, layerId_polygonFill, sourceId, groups, filterId, 'fill', c, 'polygons');
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_polygonFill);
		pushToPath(idCollector, 'types.polygons.all', layerId_polygonFill);
		pushToPath(idCollector, 'types.polygons.fills', layerId_polygonFill);
		pushToPath(idCollector, 'shapes.fills', layerId_polygonFill);

		// --------------------------------------
		// Polygons - Contours Glow
		// --------------------------------------
		if (c('polygons.hasGlow')) {
			// Tweak lineWidth for glow in all stylesets
			collStyleset = tweakGlowStyle(collStyleset, 'polygons');
			collStyleset.force = tweakGlowStyle(collStyleset.force, 'polygons');
			featStyleset = tweakGlowStyle(featStyleset, 'polygons');
			presetStyleset = tweakGlowStyle(presetStyleset, 'polygons');

			map = addLayer(
				map,
				layerId_polygonContourGlow,
				sourceId,
				groups,
				filterId,
				'line',
				c,
				'polygons'
			);
			// Push to idCollector

			// New way
			pushToPath(idCollector, 'all', layerId_polygonContourGlow);
			pushToPath(idCollector, 'types.polygons.all', layerId_polygonContourGlow); // change me
			pushToPath(idCollector, 'types.polygons.contours.all', layerId_polygonContourGlow); // change me
			pushToPath(idCollector, 'types.polygons.contours.glows', layerId_polygonContourGlow); // change me
			pushToPath(idCollector, 'shapes.special.lineGlows', layerId_polygonContourGlow); // change me
		}

		// --------------------------------------
		// Polygons - Contours Regular
		// --------------------------------------
		map = addLayer(map, layerId_polygonContour, sourceId, groups, filterId, 'line', c, 'polygons');
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_polygonContour);
		pushToPath(idCollector, 'types.polygons.all', layerId_polygonContour);
		pushToPath(idCollector, 'types.polygons.contours.all', layerId_polygonContour);
		pushToPath(idCollector, 'shapes.lines', layerId_polygonContour);

		// --------------------------------------
		// Polygons - Corners as Circles
		// --------------------------------------
		map = addLayer(
			map,
			layerId_polygonCornerCircle,
			sourceId,
			groups,
			filterId,
			'circle',
			c,
			'polygons'
		);
		// Push to idCollector

		pushToPath(idCollector, 'all', layerId_polygonCornerCircle);
		pushToPath(idCollector, 'types.polygons.all', layerId_polygonCornerCircle);
		pushToPath(idCollector, 'types.polygons.corners.all', layerId_polygonCornerCircle);
		pushToPath(idCollector, 'types.polygons.corners.circles', layerId_polygonCornerCircle);
		pushToPath(idCollector, 'shapes.circles', layerId_polygonCornerCircle);

		// --------------------------------------
		// Polygons - Corners as Symbols
		// --------------------------------------
		map = addLayer(
			map,
			layerId_polygonCornerSymbol,
			sourceId,
			groups,
			filterId,
			'symbol',
			c,
			'polygons'
		);
		// Push to idCollector
		pushToPath(idCollector, 'all', layerId_polygonCornerSymbol);
		pushToPath(idCollector, 'types.polygons.all', layerId_polygonCornerSymbol);
		pushToPath(idCollector, 'types.polygons.corners.all', layerId_polygonCornerSymbol);
		pushToPath(idCollector, 'types.polygons.corners.symbols', layerId_polygonCornerSymbol);
		pushToPath(idCollector, 'shapes.symbols', layerId_polygonCornerSymbol);

		// =====================================================================================
	} else if (feature.properties.shape === 'GeometryCollection') {
		// =====================================================================================
		// --------------------------------------
		// Geometry Collection
		// --------------------------------------
		//! TODO: maybe, this should sort of recall the function?!
	}

	return { map: map, idCollector: idCollector };
}
