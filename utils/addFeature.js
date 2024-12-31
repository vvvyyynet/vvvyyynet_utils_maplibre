import maplibregl from 'maplibre-gl';
import { addLayer } from './addLayer';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function accumulateKeyValuePairs(keyvaluepairs) {
	// Accumulate all key-value pairs with valid value
	return keyvaluepairs.reduce((acc, [key, value]) => {
		if (value) {
			acc[key] = value;
			//! TODO: feat: add type-checker!!
		}
		return acc;
	}, {});
}

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

function makeLayerInteractive(map, layerId) {
	map.on('click', layerId, (e) => {
		const feature = e.features[0];
		// ------------------------------------------
		// Console Info
		// console.log(feature.geometry);

		// ------------------------------------------
		// Popup
		if (
			!!feature.properties.title ||
			!!feature.properties.description ||
			!!feature.properties.imageURL ||
			!!feature.properties.imageURL2
		) {
			const popup = new maplibregl.Popup({
				offset: 25,
				className: 'custom-popup',
				closeButton: false
			})
				.setLngLat(e.lngLat) // Set popup at the clicked location
				.setHTML(
					`
				<div class="absolute top-0 left-0 w-full h-[30px] bg-gradient-to-b from-white to-transparent pointer-events-none">
				</div>
				<h3 class="text-base font-bold text-gray-600 mb-2">${feature.properties.title || ''}</h3>
				<div class="pb-5 max-h-[50vh] w-full bg-white overflow-y-auto">
					${
						!!feature.properties.imageURL
							? `<img class="my-5 max-h-[30vh] mx-auto self-center max-w-full rotate-[1deg]" src="${feature.properties.imageURL}" alt="image"/>`
							: ''
					}
					<p class="text-xs">${feature.properties.description || ''}</p>
					${
						!!feature.properties.imageURL2
							? `<img class="my-5 max-h-[30vh] mx-auto self-center max-w-full rotate-[-2deg]" src="${feature.properties.imageURL2}" alt="image"/>`
							: ''
					}
					</div>
					<div class="absolute bottom-0 left-0 w-full h-[50px] bg-gradient-to-b from-transparent to-white pointer-events-none">
					</div>`
				)
				.addTo(map);
		}

		// ------------------------------------------
		// Center map on feature's coordinates
		var coords = e.features[0].geometry.coordinates;
		// workaround for features that are not points //! BETTER: evaluate center of all points
		while (coords[0].length > 1) {
			coords = coords[0];
		}
		// map.flyTo({
		// 	center: coords
		// });
	});

	map.on('mouseenter', layerId, () => {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', layerId, () => {
		map.getCanvas().style.cursor = '';
	});
}

//////////////////////////////////////////////////////////////////////////////////////////
// Add Feature
//////////////////////////////////////////////////////////////////////////////////////////
export function addFeature(
	map,
	feature,
	sourceId,
	layerId,
	featStyleset = {}, // styling as read from geoJSON
	collStyleset = {}, // manual styling
	groups = [],
	{
		idCollector = {
			all: [],
			shapes: {
				symbols: [],
				circles: [],
				lines: [],
				fills: [],
				special: {
					backdropCircles: [],
					lineGlows: []
				}
			},
			types: {
				points: {
					all: [],
					symbols: [],
					circles: [],
					backdropCircles: []
				},
				lines: {
					all: [],
					lines: {
						all: [],
						glows: []
					},
					corners: {
						all: [],
						symbols: [],
						circles: []
					}
				},
				polygons: {
					all: [],
					fills: [],
					contours: {
						all: [],
						glows: []
					},
					corners: {
						all: [],
						symbols: [],
						circles: []
					}
				}
			}
		},
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
				idCollector.all.push(layerId_pointCircle);
				idCollector.types.points.all.push(layerId_pointCircle);
				idCollector.types.points.circles.push(layerId_pointCircle);
				idCollector.shapes.circles.push(layerId_pointCircle);
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
					idCollector.all.push(layerId_pointBackdropCircle);
					idCollector.types.points.all.push(layerId_pointBackdropCircle);
					idCollector.types.points.backdropCircles.push(layerId_pointBackdropCircle);
					idCollector.shapes.special.backdropCircles.push(layerId_pointBackdropCircle);
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
				idCollector.all.push(layerId_pointSymbol);
				idCollector.types.points.all.push(layerId_pointSymbol);
				idCollector.types.points.symbols.push(layerId_pointSymbol);
				idCollector.shapes.symbols.push(layerId_pointSymbol);
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
			idCollector.all.push(layerId_lineGlow);
			idCollector.types.lines.all.push(layerId_lineGlow);
			idCollector.types.lines.lines.all.push(layerId_lineGlow);
			idCollector.types.lines.lines.glows.push(layerId_lineGlow);
			idCollector.shapes.special.lineGlows.push(layerId_lineGlow);
		}

		// --------------------------------------
		// Lines - Regular Lines
		// --------------------------------------
		map = addLayer(map, layerId_line, sourceId, groups, filterId, 'line', c, 'lines');
		// Push to idCollector
		idCollector.all.push(layerId_line);
		idCollector.types.lines.all.push(layerId_line);
		idCollector.types.lines.lines.all.push(layerId_line);
		idCollector.shapes.lines.push(layerId_line);

		// --------------------------------------
		// Lines - Corners as Circles
		// --------------------------------------
		map = addLayer(map, layerId_lineCornerCircle, sourceId, groups, filterId, 'circle', c, 'lines');
		// Push to idCollector
		idCollector.all.push(layerId_lineCornerCircle);
		idCollector.types.lines.all.push(layerId_lineCornerCircle);
		idCollector.types.lines.corners.all.push(layerId_lineCornerCircle);
		idCollector.types.lines.corners.circles.push(layerId_lineCornerCircle);
		idCollector.shapes.circles.push(layerId_lineCornerCircle);

		// --------------------------------------
		// Lines - Corners as Symbols
		// --------------------------------------
		map = addLayer(map, layerId_lineCornerSymbol, sourceId, groups, filterId, 'symbol', c, 'lines');
		// Push to idCollector
		idCollector.all.push(layerId_lineCornerSymbol);
		idCollector.types.lines.all.push(layerId_lineCornerSymbol);
		idCollector.types.lines.corners.all.push(layerId_lineCornerSymbol);
		idCollector.types.lines.corners.symbols.push(layerId_lineCornerSymbol);
		idCollector.shapes.symbols.push(layerId_lineCornerSymbol);

		// =====================================================================================
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// =====================================================================================
		// --------------------------------------
		// Polygons - Filling
		// --------------------------------------
		map = addLayer(map, layerId_polygonFill, sourceId, groups, filterId, 'fill', c, 'polygons');
		// Push to idCollector
		idCollector.all.push(layerId_polygonFill);
		idCollector.types.polygons.all.push(layerId_polygonFill);
		idCollector.types.polygons.fills.push(layerId_polygonFill);
		idCollector.shapes.fills.push(layerId_polygonFill);

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
			idCollector.all.push(layerId_polygonContourGlow);
			idCollector.types.polygons.all.push(layerId_polygonContourGlow);
			idCollector.types.polygons.contours.all.push(layerId_polygonContourGlow);
			idCollector.types.polygons.contours.glows.push(layerId_polygonContourGlow);
			idCollector.shapes.special.lineGlows.push(layerId_polygonContourGlow);
		}

		// --------------------------------------
		// Polygons - Contours Regular
		// --------------------------------------
		map = addLayer(map, layerId_polygonContour, sourceId, groups, filterId, 'line', c, 'polygons');
		// Push to idCollector
		idCollector.all.push(layerId_polygonContour);
		idCollector.types.polygons.all.push(layerId_polygonContour);
		idCollector.types.polygons.contours.all.push(layerId_polygonContour);
		idCollector.shapes.lines.push(layerId_polygonContour);

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
		idCollector.all.push(layerId_polygonCornerCircle);
		idCollector.types.polygons.all.push(layerId_polygonCornerCircle);
		idCollector.types.polygons.corners.all.push(layerId_polygonCornerCircle);
		idCollector.types.polygons.corners.circles.push(layerId_polygonCornerCircle);
		idCollector.shapes.circles.push(layerId_polygonCornerCircle);

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
		idCollector.all.push(layerId_polygonCornerSymbol);
		idCollector.types.polygons.all.push(layerId_polygonCornerSymbol);
		idCollector.types.polygons.corners.all.push(layerId_polygonCornerSymbol);
		idCollector.types.polygons.corners.symbols.push(layerId_polygonCornerSymbol);
		idCollector.shapes.symbols.push(layerId_polygonCornerSymbol);

		// =====================================================================================
	} else if (feature.properties.shape === 'GeometryCollection') {
		// =====================================================================================
		// --------------------------------------
		// Geometry Collection
		// --------------------------------------
		//! TODO: maybe, this should sort of recall the function?!
	}

	// -------------------------------------------
	// Make layer interactive
	makeLayerInteractive(map, layerId);
	return { map: map, idCollector: idCollector };
}
