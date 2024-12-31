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
		getNestedProperty(collStyleset, forcePath) ??
		getNestedProperty(featStyleset, path) ??
		(acceptTopLevelFeatureProps
			? getNestedProperty(featProps, path.split('.').pop())
			: undefined) ??
		getNestedProperty(collStyleset, path) ??
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
		collCallbacks = {},
		collStyleset = {}, // manual styling
		featStyleset = {}, // styling as read from geoJSON
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
				((layerId) => {
					map = addLayer(map, layerId, sourceId, groups, filterId, 'circle', c, 'points.circle');

					// Execute Callbacks on relevant nodes
					if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
					if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
					if (typeof collCallbacks?.points == 'function') collCallbacks.points(map, layerId);
					if (typeof collCallbacks?.points?.all == 'function')
						collCallbacks.points.all(map, layerId);
					if (typeof collCallbacks?.points?.circles == 'function')
						collCallbacks.points.circles(map, layerId);

					// Push to idCollector
					pushToPath(idCollector, 'all', layerId);
					pushToPath(idCollector, 'types.points.all', layerId);
					pushToPath(idCollector, 'types.points.circles', layerId);
					pushToPath(idCollector, 'shapes.circles', layerId);
				})(layerId_pointCircle);
				break;

			case 'symbol':
				// --------------------------------------
				// Points - Points as Symbols (Backdrops)
				// --------------------------------------
				if (c('points.symbol.hasBackdropCircle')) {
					((layerId) => {
						map = addLayer(
							map,
							layerId,
							sourceId,
							groups,
							filterId,
							'circle',
							c,
							'points.symbol.backdropCircle'
						);

						// Execute Callbacks on relevant nodes
						if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
						if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
						if (typeof collCallbacks?.points == 'function') collCallbacks.points(map, layerId);
						if (typeof collCallbacks?.points?.all == 'function')
							collCallbacks.points.all(map, layerId);
						if (typeof collCallbacks?.points?.backdropCircles == 'function')
							collCallbacks.points.backdropCircles(map, layerId);

						// Push to idCollector
						pushToPath(idCollector, 'all', layerId);
						pushToPath(idCollector, 'types.points.all', layerId);
						pushToPath(idCollector, 'types.points.backdropCircles', layerId);
						pushToPath(idCollector, 'shapes.special.backdropCircles', layerId);
					})(layerId_pointBackdropCircle);
				}

				// --------------------------------------
				// Points - Points as Symbols
				// --------------------------------------
				((layerId) => {
					map = addLayer(map, layerId, sourceId, groups, filterId, 'symbol', c, 'points.symbol');
					// Execute Callbacks on relevant nodes
					if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
					if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
					if (typeof collCallbacks?.points == 'function') collCallbacks.points(map, layerId);
					if (typeof collCallbacks?.points?.all == 'function')
						collCallbacks.points.all(map, layerId);
					if (typeof collCallbacks?.points?.symbols == 'function')
						collCallbacks.points.symbols(map, layerId);

					// Push to idCollector
					pushToPath(idCollector, 'all', layerId);
					pushToPath(idCollector, 'types.points.all', layerId);
					pushToPath(idCollector, 'types.points.symbols', layerId);
					pushToPath(idCollector, 'shapes.symbols', layerId);
				})(layerId_pointSymbol);

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

			((layerId) => {
				map = addLayer(map, layerId, sourceId, groups, filterId, 'line', c, 'lines.glow');

				// Execute Callbacks on relevant nodes
				if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
				if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
				if (typeof collCallbacks?.lines == 'function') collCallbacks.lines(map, layerId);
				if (typeof collCallbacks?.lines?.all == 'function') collCallbacks.lines.all(map, layerId);
				if (typeof collCallbacks?.lines?.lines == 'function')
					collCallbacks.lines.lines(map, layerId);
				if (typeof collCallbacks?.lines?.lines?.all == 'function')
					collCallbacks.lines.lines.all(map, layerId);
				if (typeof collCallbacks?.lines?.lines?.lineGlows == 'function')
					collCallbacks.lines.lines.lineGlows(map, layerId);

				// Push to idCollector
				pushToPath(idCollector, 'all', layerId);
				pushToPath(idCollector, 'types.lines.all', layerId);
				pushToPath(idCollector, 'types.lines.lines.all', layerId);
				pushToPath(idCollector, 'types.lines.lines.glows', layerId);
				pushToPath(idCollector, 'shapes.special.lineGlows', layerId);
			})(layerId_lineGlow);
		}

		// --------------------------------------
		// Lines - Regular Lines
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'line', c, 'lines');
			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.lines == 'function') collCallbacks.lines(map, layerId);
			if (typeof collCallbacks?.lines?.all == 'function') collCallbacks.lines.all(map, layerId);
			if (typeof collCallbacks?.lines?.regLines == 'function')
				collCallbacks.lines.regLines(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.lines.all', layerId);
			pushToPath(idCollector, 'types.lines.lines.all', layerId);
			pushToPath(idCollector, 'shapes.lines', layerId);
		})(layerId_line);

		// --------------------------------------
		// Lines - Corners as Circles
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'circle', c, 'lines');

			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.lines == 'function') collCallbacks.lines(map, layerId);
			if (typeof collCallbacks?.lines?.all == 'function') collCallbacks.lines.all(map, layerId);
			if (typeof collCallbacks?.lines?.corners == 'function')
				collCallbacks.lines.corners(map, layerId);
			if (typeof collCallbacks?.lines?.corners?.all == 'function')
				collCallbacks.lines.corners.all(map, layerId);
			if (typeof collCallbacks?.lines?.corners?.circles == 'function')
				collCallbacks.lines.corners.circles(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.lines.all', layerId);
			pushToPath(idCollector, 'types.lines.corners.all', layerId);
			pushToPath(idCollector, 'types.lines.corners.circles', layerId);
			pushToPath(idCollector, 'shapes.circles', layerId);
		})(layerId_lineCornerCircle);

		// --------------------------------------
		// Lines - Corners as Symbols
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'symbol', c, 'lines');
			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.lines == 'function') collCallbacks.lines(map, layerId);
			if (typeof collCallbacks?.lines?.all == 'function') collCallbacks.lines.all(map, layerId);
			if (typeof collCallbacks?.lines?.corners == 'function')
				collCallbacks.lines.corners(map, layerId);
			if (typeof collCallbacks?.lines?.corners?.all == 'function')
				collCallbacks.lines.corners.all(map, layerId);
			if (typeof collCallbacks?.lines?.corners?.symbols == 'function')
				collCallbacks.lines.corners.symbols(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.lines.all', layerId);
			pushToPath(idCollector, 'types.lines.corners.all', layerId);
			pushToPath(idCollector, 'types.lines.corners.symbols', layerId);
			pushToPath(idCollector, 'shapes.symbols', layerId);
		})(layerId_lineCornerSymbol);

		// =====================================================================================
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// =====================================================================================
		// --------------------------------------
		// Polygons - Filling
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'fill', c, 'polygons');
			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.polygons == 'function') collCallbacks.polygons(map, layerId);
			if (typeof collCallbacks?.polygons?.all == 'function')
				collCallbacks.polygons.all(map, layerId);
			if (typeof collCallbacks?.polygons?.fills == 'function')
				collCallbacks.polygons.fills(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.polygons.all', layerId);
			pushToPath(idCollector, 'types.polygons.fills', layerId);
			pushToPath(idCollector, 'shapes.fills', layerId);
		})(layerId_polygonFill);

		// --------------------------------------
		// Polygons - Contours Glow
		// --------------------------------------
		if (c('polygons.hasGlow')) {
			// Tweak lineWidth for glow in all stylesets
			collStyleset = tweakGlowStyle(collStyleset, 'polygons');
			collStyleset.force = tweakGlowStyle(collStyleset.force, 'polygons');
			featStyleset = tweakGlowStyle(featStyleset, 'polygons');
			presetStyleset = tweakGlowStyle(presetStyleset, 'polygons');

			((layerId) => {
				map = addLayer(map, layerId, sourceId, groups, filterId, 'line', c, 'polygons');
				// Execute Callbacks on relevant nodes
				if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
				if (typeof collCallbacks?.all == 'function') collCallbacks?.all(map, layerId);
				if (typeof collCallbacks?.polygons == 'function') collCallbacks?.polygons(map, layerId);
				if (typeof collCallbacks?.polygons?.all == 'function')
					collCallbacks.polygons.all(map, layerId);
				if (typeof collCallbacks?.polygons?.contours == 'function')
					collCallbacks.polygons.contours(map, layerId);
				if (typeof collCallbacks?.polygons?.contours?.all == 'function')
					collCallbacks.polygons.contours.all(map, layerId);
				if (typeof collCallbacks?.polygons?.contours?.lineGlows == 'function')
					collCallbacks.polygons.contours.lineGlows(map, layerId);

				// Push to idCollector
				pushToPath(idCollector, 'all', layerId);
				pushToPath(idCollector, 'types.polygons.all', layerId); // change me
				pushToPath(idCollector, 'types.polygons.contours.all', layerId); // change me
				pushToPath(idCollector, 'types.polygons.contours.glows', layerId); // change me
				pushToPath(idCollector, 'shapes.special.lineGlows', layerId); // change me
			})(layerId_polygonContourGlow);
		}

		// --------------------------------------
		// Polygons - Contours Regular
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'line', c, 'polygons');
			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.polygons == 'function') collCallbacks.polygons(map, layerId);
			if (typeof collCallbacks?.polygons?.all == 'function')
				collCallbacks.polygons.all(map, layerId);
			if (typeof collCallbacks?.polygons?.contours == 'function')
				collCallbacks.polygons.contours(map, layerId);
			if (typeof collCallbacks?.polygons?.contours?.all == 'function')
				collCallbacks.polygons.contours.all(map, layerId);
			if (typeof collCallbacks?.polygons?.contours?.regLines == 'function')
				collCallbacks.polygons.contours.regLines(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.polygons.all', layerId);
			pushToPath(idCollector, 'types.polygons.contours.all', layerId);
			pushToPath(idCollector, 'shapes.polygons', layerId);
		})(layerId_polygonContour);

		// --------------------------------------
		// Polygons - Corners as Circles
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'circle', c, 'polygons');

			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.polygons == 'function') collCallbacks.polygons(map, layerId);
			if (typeof collCallbacks?.polygons?.all == 'function')
				collCallbacks.polygons.all(map, layerId);
			if (typeof collCallbacks?.polygons?.corners == 'function')
				collCallbacks.polygons.corners(map, layerId);
			if (typeof collCallbacks?.polygons?.corners?.all == 'function')
				collCallbacks.polygons.corners.all(map, layerId);
			if (typeof collCallbacks?.polygons?.corners?.circles == 'function')
				collCallbacks.polygons.corners.circles(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.polygons.all', layerId);
			pushToPath(idCollector, 'types.polygons.corners.all', layerId);
			pushToPath(idCollector, 'types.polygons.corners.circles', layerId);
			pushToPath(idCollector, 'shapes.circles', layerId);
		})(layerId_polygonCornerCircle);

		// --------------------------------------
		// Polygons - Corners as Symbols
		// --------------------------------------
		((layerId) => {
			map = addLayer(map, layerId, sourceId, groups, filterId, 'symbol', c, 'polygons');
			// Execute Callbacks on relevant nodes
			if (typeof collCallbacks == 'function') collCallbacks(map, layerId);
			if (typeof collCallbacks?.all == 'function') collCallbacks.all(map, layerId);
			if (typeof collCallbacks?.polygons == 'function') collCallbacks.polygons(map, layerId);
			if (typeof collCallbacks?.polygons?.all == 'function')
				collCallbacks.polygons.all(map, layerId);
			if (typeof collCallbacks?.polygons?.corners == 'function')
				collCallbacks.polygons.corners(map, layerId);
			if (typeof collCallbacks?.polygons?.corners?.all == 'function')
				collCallbacks.polygons.corners.all(map, layerId);
			if (typeof collCallbacks?.polygons?.corners?.symbols == 'function')
				collCallbacks.polygons.corners.symbols(map, layerId);

			// Push to idCollector
			pushToPath(idCollector, 'all', layerId);
			pushToPath(idCollector, 'types.polygons.all', layerId);
			pushToPath(idCollector, 'types.polygons.corners.all', layerId);
			pushToPath(idCollector, 'types.polygons.corners.symbols', layerId);
			pushToPath(idCollector, 'shapes.symbols', layerId);
		})(layerId_polygonCornerSymbol);

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
