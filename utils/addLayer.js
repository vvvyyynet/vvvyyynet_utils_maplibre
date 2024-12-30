import maplibregl from 'maplibre-gl';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function getNestedProperty(base, path) {
	return path.split('.').reduce((obj, key) => {
		return obj?.[key];
	}, base);
}

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
	return [[base].prefix, layerId, [base].postfix].join([base].sep);
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

function coalesce(manualStyleset, featureStyleset, defaultStyleset, path, allowDirectAccess) {
	const forcePath = `force.${path}`;

	// Slow version with output (only for debugging)
	const val1 = getNestedProperty(manualStyleset, forcePath);
	const val2 = getNestedProperty(featureStyleset, path);
	const val3 = getNestedProperty(featureStyleset, path.split('.').pop()); // last element
	const val4 = getNestedProperty(manualStyleset, path);
	const val5 = getNestedProperty(defaultStyleset, path);
	const returnvalue = val1 || val2 || (allowDirectAccess ? val3 : undefined) || val4 || val5;
	if (path.split('.').pop() == 'lineDashArray') {
		// if (true) {
		console.log('path', path);
		console.log('manualStyleset forced: ', val1);
		console.log('featureStyleset nested: ', val2);
		console.log('featureStyleset direct: ', val3);
		console.log('manualStyleset normal: ', val4);
		console.log('defaultStyleset: ', val5);
		console.log(path, returnvalue);
	}
	return returnvalue;

	// Fast version (will stop calculating as soon as truthy value is found)
	// return (
	// 	getNestedProperty(manualStyleset, forcePath) ||
	// 	getNestedProperty(featureStyleset, path) ||
	// 	(allowDirectAccess ? getNestedProperty(featureStyleset, path.split('.').pop()) : undefined) ||
	// 	getNestedProperty(manualStyleset, path) ||
	// 	getNestedProperty(defaultStyleset, path)
	// );
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
// Add Layer Function
//////////////////////////////////////////////////////////////////////////////////////////
export function addLayer(
	map,
	feature,
	sourceId,
	layerId,
	featureStyleset = {}, // styling as read from geoJSON
	manualStyleset = {}, // manual styling
	groupNames = [],
	{
		idCollector = {
			all: [],
			points: [],
			pointBackdrops: [],
			lines: [],
			lineGlows: [],
			polygons: [],
			polygonFills: [],
			polygonContours: [],
			polygonContourGlows: [],
			polygonPoints: []
		},
		allowDirectAccess = false,
		defaultStyleset = {}, // default styles
		idConstructors = {
			point: { prefix: 'POINT', postfix: '', sep: '-' },
			pointBackdrop: { prefix: 'POINTBACKDROP', postfix: '', sep: '-' },
			line: { prefix: 'LINE', postfix: '', sep: '-' },
			lineGlow: { prefix: 'LINEGLOW', postfix: '', sep: '-' },
			polygonFill: { prefix: 'POLYGONFILL', postfix: '', sep: '-' },
			PolygonContour: { prefix: 'POLYGONCONTOURS', postfix: '', sep: '-' },
			PolygonContourGlow: { prefix: 'POLYGONCONTOURSGLOW', postfix: '', sep: '-' },
			polygonPoints: { prefix: 'POLYGONPOINTS', postfix: '', sep: '-' }
		}
	}
) {
	const layerIdPoint = constructId(idConstructors.point, layerId);
	const layerIdPointBackdrop = constructId(idConstructors.pointBackdrop, layerId);
	const layerIdLine = constructId(idConstructors.line, layerId);
	const layerIdLineGlow = constructId(idConstructors.lineGlow, layerId);
	const layerIdPolygonFill = constructId(idConstructors.polygonFill, layerId);
	const layerIdPolygonContour = constructId(idConstructors.PolygonContour, layerId);
	const layerIdPolygonContourGlow = constructId(idConstructors.PolygonContourGlow, layerId);
	const layerIdPolygonPoints = constructId(idConstructors.polygonPoints, layerId);

	// ---------------------------------------------------------------------------------------
	// CHECKS
	// Test for missing id
	if (!layerId) {
		console.warn('missing layerId detected: ', feature);
		return;
	}

	// Test for duplicate layers
	if (map.getLayer(layerId)) {
		console.warn('duplicate layerId detected: ', layerId, feature);
		return;
	}
	// Test for nullis features
	if (!feature) {
		console.warn('nullish feature detected : ', layerId, feature);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// CHECK FEATURE TYPE
	const featureType = feature?.geometry?.type;

	// ---------------------------------------------------------------------------------------
	// RE-DEFINE COALESCE FUNCTION
	function c(path) {
		return coalesce(manualStyleset, featureStyleset, defaultStyleset, path, allowDirectAccess);
	}
	// ---------------------------------------------------------------------------------------
	// ADD LAYER

	// --------------------------------------
	// Points
	// --------------------------------------
	if (featureType === 'MultiPoint' || featureType === 'Point') {
		switch (c('points.type')) {
			// Add simple circles
			case 'circle':
				map.addLayer({
					id: layerIdPoint,
					type: 'circle',
					source: sourceId,
					layout: {
						...accumulateKeyValuePairs([
							['visibility', c('points.setInvisible') ? 'none' : 'visible']
						])
					},
					paint: {
						...accumulateKeyValuePairs([
							['circle-radius', c('points.circle.circleRadius')],
							['circle-color', c('points.circle.circleColor')],
							['circle-stroke-color', c('points.circle.circleStrokeColor')],
							['circle-stroke-width', c('points.circle.circleStrokeWidth')]
						])
					},
					filter: ['==', ['get', 'id'], feature.properties.id]
				});
				break;

			// Add icons
			case 'icon':
				// Add backdrop circle
				if (c('points.icon.hasIconBackdrop')) {
					//! TODO: this could be rewritten similar to glow, where addLayer is calling itself with a modified setyleset.
					map.addLayer({
						id: layerIdPointBackdrop,
						type: 'circle',
						source: sourceId,
						metadata: {
							groupNames: groupNames
						},
						layout: {
							...accumulateKeyValuePairs([
								['visibility', c('points.setInvisible') ? 'none' : 'visible']
							])
						},
						paint: {
							...accumulateKeyValuePairs([
								['circle-radius', c('points.icon.backdrop.circleRadius')],
								['circle-color', c('points.icon.backdrop.circleColor')],
								['circle-stroke-color', c('points.icon.backdrop.circleStrokeColor')],
								['circle-stroke-width', c('points.icon.backdrop.circleStrokeWidth')]
							])
						},
						filter: ['==', ['get', 'id'], feature.properties.id]
					});
				}

				// Add custom icon
				map.addLayer({
					id: layerIdPoint,
					type: 'symbol',
					source: sourceId,
					metadata: {
						groupNames: groupNames
					},
					layout: {
						...accumulateKeyValuePairs([
							['visibility', c('points.setInvisible') ? 'none' : 'visible'],
							['icon-image', c('points.icon.iconImage')],
							['icon-size', c('points.icon.iconSize')],
							['icon-anchor', c('points.icon.iconAnchor')],
							['icon-overlap', c('points.icon.iconOverlap')],
							['text-field', c('points.icon.textField')],
							['text-offset', c('points.icon.textOffset')],
							['text-anchor', c('points.icon.textAnchor')],
							['text-font', c('points.icon.textFont')]
						])
					},
					filter: ['==', ['get', 'id'], feature.properties.id]
				});
				break;
		}

		// PUSH TO ID-COLLECTOR
		idCollector.all.push(layerIdPoint);
		idCollector.points.push(layerIdPoint);
		if (c('points.icon.hasIconBackdrop')) {
			idCollector.all.push(layerIdPointBackdrop);
			idCollector.Backdrops.push(layerIdPointBackdrop);
			idCollector.dict.push({
				source: sourceId,
				id: layerIdPointBackdrop
			});
		}

		// --------------------------------------
		// Lines
		// --------------------------------------
	} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
		// CHECK GLOW AND RE-RUN addLayer
		if (c('lines.hasGlow')) {
			const manualStylesetOfGlow = { ...manualStyleset }; // shallow copy is important!

			// set all hasGlow properties false
			setAtPath(manualStyleset, 'lines.hasGlow', false);
			setAtPath(manualStyleset, 'force.lines.hasGlow', false);
			setAtPath(featureStyleset, 'lines.hasGlow', false);
			setAtPath(featureStyleset, 'force.lines.hasGlow', false);

			// setAtPath(featureStyleset, 'hasGlow', false); //! DEBUG: This is an implementation for the non-nested featureStyleset version, but be careful not to mix co-existing glows on different feature types!
			setAtPath(manualStylesetOfGlow, 'lines.isGlow', true);
			setAtPath(manualStylesetOfGlow, 'force.lines.isGlow', true);

			//
			addLayer(map, feature, sourceId, layerId, featureStyleset, manualStylesetOfGlow, groupNames, {
				idCollector: idCollector,
				allowDirectAccess: allowDirectAccess,
				defaultStyleset: defaultStyleset
			});

			// before continuing, make sure isGlow is false for normal line
			setAtPath(manualStyleset, 'lines.isGlow', false);
			setAtPath(manualStyleset, 'force.lines.isGlow', false);
		}

		const lineWidthGlowFactor = manualStyleset?.lines?.isGlow
			? c('lines.glow.lineWidthGlowFactor')
			: 1; // set 1 for nonGlow line (note, that two lines will be added on top of each other!)

		map.addLayer({
			id: manualStyleset?.lines?.isGlow ? layerIdLineGlow : layerIdLine,
			type: 'line',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				...accumulateKeyValuePairs([
					['visibility', c('lines.setInvisible') ? 'none' : 'visible'],
					['line-join', c('lines.lineJoin')],
					['line-cap', c('lines.lineCap')]
				])
			},
			paint: {
				...accumulateKeyValuePairs([
					[
						'line-dasharray',
						manualStyleset?.lines?.isGlow ? c('lines.glow.lineDashArray') : c('lines.lineDashArray')
					],
					[
						'line-color',
						manualStyleset?.lines?.isGlow ? c('lines.glow.lineColor') : c('lines.lineColor')
					],
					[
						'line-opacity',
						manualStyleset?.lines?.isGlow ? c('lines.glow.lineOpacity') : c('lines.lineOpacity')
					],
					['line-width', c('lines.lineWidth') * lineWidthGlowFactor],
					[
						'line-blur',
						manualStyleset?.lines?.isGlow ? c('lines.glow.lineBlur') : c('lines.lineBlur')
					] //! DEBUG: not setting defaultStyleset may break
				]) //! DEBUG undefined*Number = NaN... does this cause any problems?
			},
			//! DEBUG Mixing (fixed) lineWidth with lineWidthArray will NOT work! try with nested coalesce, but I fear, this won't not work either
			// 'line-width':
			// 	(c('lines.lineWidth') || [
			// 		'interpolate',
			// 		['linear'],
			// 		['zoom'],
			// 		//!? Can I spread? ...c('foo.bar.lineWidthArray') to have as many as I need?
			// 		//! -> maybe even put 'linear' and 'zoom' on [0] and [1] and start array at [2]
			// 		c('lines.lineWidthArray')[0],
			// 		c('lines.lineWidthArray')[1],
			// 		c('lines.lineWidthArray')[2],
			// 		c('lines.lineWidthArray')[3]
			// 	]) * lineWidthGlowFactor,
			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// PUSH TO ID-COLLECTOR
		idCollector.all.push(layerIdLine);
		idCollector.lines.push(layerIdLine);

		if (manualStyleset?.lines?.isGlow) {
			idCollector.all.push(layerIdLineGlow);
			idCollector.lineGlows.push(layerIdLineGlow);
		}

		// --------------------------------------
		// Polygons
		// --------------------------------------
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// Filling
		map.addLayer({
			id: layerIdPolygonFill,
			type: 'fill',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				...accumulateKeyValuePairs([
					['visibility', c('polygons.setInvisible') ? 'none' : 'visible']
				])
			},
			paint: {
				...accumulateKeyValuePairs([
					['fill-color', c('polygons.fillColor')],
					['fill-pattern', c('polygons.fillPattern')], // Note, that setting 'fill-pattern':null will still remove fillColor!! (This is a //! BUG in maplibre)
					['fill-opacity', c('polygons.fillOpacity')],
					['fill-antialias', c('polygons.fillAntialias')]
				])
			},
			...accumulateKeyValuePairs([['maxzoom', c('polygons.maxZoom')]]),

			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// ContourLine
		const lineWidthGlowFactor = manualStyleset?.polygons?.isGlow
			? c('poolygon.glow.lineWidthGlowFactor')
			: 1; // set 1 for nonGlow line (note, that two lines will be added on top of each other!)

		map.addLayer({
			id: layerIdPolygonContour,
			type: 'line',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				...accumulateKeyValuePairs([
					['visibility', c('polygons.setInvisible') ? 'none' : 'visible'],
					['line-join', c('polygons.lineJoin')]
				])
			},
			paint: {
				...accumulateKeyValuePairs([
					[
						'line-dasharray',
						manualStyleset?.polygons?.isGlow
							? c('polygons.glow.lineDashArray')
							: c('polygons.lineDashArray')
					],
					[
						'line-color',
						manualStyleset?.polygons?.isGlow
							? c('polygons.glow.lineColor')
							: c('polygons.lineColor')
					],
					[
						'line-opacity',
						manualStyleset?.polygons?.isGlow
							? c('polygons.glow.lineOpacity')
							: c('polygons.lineOpacity')
					],
					[
						'line-blur',
						manualStyleset?.polygons?.isGlow ? c('polygons.glow.lineBlur') : c('polygons.lineBlur')
					],
					[('line-width', c('polygons.lineWidth') * lineWidthGlowFactor)] //! DEBUG undefined*Number = NaN... does this cause any problems? Moreover, if no defaultStyleset is provided this won't work, since multiplication is not forwarded to maplibregl... but I think this is fine, but needs to be documented.
					//! TODO: implement 'line-width': ['interpolate', ['linear'], ['zoom']],
				])
			},
			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// PUSH TO ID-COLLECTOR
		if (manualStyleset?.polygons?.isFill) {
			idCollector.all.push(layerIdPolygonFill);
			idCollector.polygons.push(layerIdPolygonFill);
			idCollector.polygonFills.push(layerIdPolygonFill);
		}
		if (manualStyleset?.polygons?.isLine) {
			idCollector.all.push(layerIdPolygonContour);
			idCollector.polygons.push(layerIdPolygonContour);
			idCollector.polygonContours.push(layerIdPolygonContour);

			if (manualStyleset?.polygons?.isGlow) {
				idCollector.all.push(layerIdPolygonContourGlow);
				idCollector.polygons.push(layerIdPolygonContourGlow);
				idCollector.polygonContours.push(layerIdPolygonContourGlow);
				idCollector.polygonContourGlows.push(layerIdPolygonContourGlow);
			}
		}
		if (manualStyleset?.polygons?.isPoints) {
			idCollector.all.push(layerIdPolygonPoints);
			idCollector.polygons.push(layerIdPolygonPoints);
			idCollector.polygonPoints.push(layerIdPolygonPoints);
		}

		// --------------------------------------
		// Circles
		//! TODO: FEATURE NOT IMPLEMENTED YET
		// --------------------------------------
	} else if (feature.properties.shape === 'Circle' && feature.properties.radius) {
		// Add circle as Point layer styled as a circle
		map.addLayer({
			id: layerId,
			type: 'circle',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			paint: {
				'circle-radius': feature.properties.radius,
				'circle-color': featureStyleset.color || '#f30',
				'circle-opacity': 0.5
			},
			layout: {
				...accumulateKeyValuePairs([['visibility', c('circles.setInvisible') ? 'none' : 'visible']])
			},
			filter: ['==', ['get', 'id'], feature.properties.id]
		});
	}

	// -------------------------------------------
	// Make layer interactive
	makeLayerInteractive(map, layerId);
	return idCollector;
}
