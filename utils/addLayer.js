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
		}
		return acc;
	}, {});
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

function setAlltoValue(object, path, value) {
	// Set a specific path both on manualStyleset and on featureStyleset to a certain value (create the path if it does not exist)
	path.split('.').reduce((acc, key, idx, arr) => {
		acc[key] = idx === arr.length - 1 ? value : acc[key] || {};
		return acc[key];
	}, object);

	// A hardcoded example for object = manualStyleset and path='lines.hasGlow'
	// manualStyleset.lines = manualStyleset.lines || {};
	// manualStyleset.lines.hasGlow = value;
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
	FEATURES = null,
	sourceId,
	layerId,
	featureStyleset = {}, // styling as read from geoJSON
	manualStyleset = {}, // manual styling
	groupNames = [],
	{
		allowDirectAccess = false,
		defaultStyleset = {} // default styles
	}
) {
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
					id: layerId,
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
					map.addLayer({
						id: `${layerId}-background`,
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
					id: layerId,
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

		// PUSH TO FEATURES
		if (FEATURES) {
			if (FEATURES.allLoaded_layerIds) {
				FEATURES.allLoaded_layerIds.push(layerId);
			}
			if (FEATURES.allLoadedPoints_layerIds) {
				FEATURES.allLoadedPoints_layerIds.push(`${layerId}-background`);
			}
			if (FEATURES.allLoadedPoints_Ids) {
				FEATURES.allLoadedPoints_Ids.push({
					source: sourceId,
					id: layerId
				});
			}
		}

		// --------------------------------------
		// Lines
		// --------------------------------------
	} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
		// CHECK GLOW AND RE-RUN addLayer
		if (c('lines.hasGlow')) {
			const manualStylesetOfGlow = { ...manualStyleset }; // shallow copy is important!

			// set all hasGlow properties false
			setAlltoValue(manualStyleset, 'lines.hasGlow', false);
			setAlltoValue(manualStyleset, 'force.lines.hasGlow', false);
			setAlltoValue(featureStyleset, 'lines.hasGlow', false);
			setAlltoValue(featureStyleset, 'force.lines.hasGlow', false);

			// setAlltoValue(featureStyleset, 'hasGlow', false); //! DEBUG: This is an implementation for the non-nested featureStyleset version, but be careful not to mix co-existing glows on different feature types!
			setAlltoValue(manualStylesetOfGlow, 'lines.isGlow', true);
			setAlltoValue(manualStylesetOfGlow, 'force.lines.isGlow', true);

			//
			addLayer(
				map,
				feature,
				FEATURES,
				sourceId,
				layerId,
				featureStyleset,
				manualStylesetOfGlow,
				groupNames,
				{
					allowDirectAccess: allowDirectAccess,
					defaultStyleset: defaultStyleset
				}
			);

			// before continuing, make sure isGlow is false for normal line
			setAlltoValue(manualStyleset, 'lines.isGlow', false);
			setAlltoValue(manualStyleset, 'force.lines.isGlow', false);
		}
		const layerIdGlow = `${layerId}-glow`;
		const lineWidthGlowFactor = manualStyleset?.lines?.isGlow
			? c('lines.glow.lineWidthGlowFactor')
			: 1; // set 1 for nonGlow line (note, that two lines will be added on top of each other!)

		map.addLayer({
			id: manualStyleset?.lines?.isGlow ? layerIdGlow : layerId,
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
					['line-dasharray', c('lines.lineDashArray')],
					['line-color', c('lines.lineColor')],
					['line-opacity', c('lines.lineOpacity')],
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

		// Manual Adjustments
		// Make sure glow is not dashed
		if (manualStyleset?.lines?.isGlow) {
			map.setPaintProperty(layerIdGlow, 'line-dasharray', null);
		}

		// PUSH TO FEATURES
		if (FEATURES) {
			if (FEATURES.allLoaded_layerIds) {
				FEATURES.allLoaded_layerIds.push(layerId);
				if (manualStyleset?.lines?.hasGlow) {
					const glow_id = `${layerId}-glow`;
					addLine(glow_id, true); //??
					FEATURES.allLoaded_layerIds.push(glow_id);
				}
			}
			console.log('FEATURES: ', FEATURES);
		}

		// --------------------------------------
		// Polygons
		// --------------------------------------
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		// Filling

		map.addLayer({
			id: layerId,
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
		const layerIdContour = `${layerId}-contour`;

		const lineWidthGlowFactor = manualStyleset?.polygons?.isGlow
			? c('poolygon.glow.lineWidthGlowFactor')
			: 1; // set 1 for nonGlow line (note, that two lines will be added on top of each other!)

		map.addLayer({
			id: layerIdContour,
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
					['line-dasharray', c('polygons.lineDashArray')],
					['line-color', c('polygons.lineColor')],
					['line-opacity', c('polygons.lineOpacity')],
					['line-width', c('polygons.lineWidth') * lineWidthGlowFactor], //! DEBUG undefined*Number = NaN... does this cause any problems? Moreover, if no defaultStyleset is provided this won't work, since multiplication is not forwarded to maplibregl... but I think this is fine, but needs to be documented.
					//! TODO: implement 'line-width': ['interpolate', ['linear'], ['zoom']],
					[
						'line-blur',
						manualStyleset?.polygons?.isGlow ? c('polygons.glow.lineBlur') : c('polygons.lineBlur')
					]
				])
			},
			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// PUSH TO FEATURES
		if (FEATURES) {
			if (FEATURES.allLoaded_layerIds) {
				FEATURES.allLoaded_layerIds.push(layerId);
				FEATURES.allLoaded_layerIds.push(layerIdContour);
			}
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

		// PUSH TO FEATURES
		if (FEATURES) {
			if (FEATURES.allLoaded_layerIds) {
				FEATURES.allLoaded_layerIds.push(layerId);
			}
		}
	}

	// -------------------------------------------
	// Make layer interactive
	makeLayerInteractive(map, layerId);
}
