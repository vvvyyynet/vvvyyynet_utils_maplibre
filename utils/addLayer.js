import maplibregl from 'maplibre-gl';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////

function getNestedProperty(base, path) {
	return path.split('.').reduce((obj, key) => {
		// console.log(obj, key);
		return obj?.[key];
	}, base);
}

// function coalesceCoalesce(base, key) {
// 	//! is this really needed?
// 	return (
// 		base?.force[key] || [
// 			'coalesce',
// 			['get', key],
// 			getgStyle(key) || base?.[key] || DEFAULTS[base][key]
// 		]
// 	);
// }

function coalesce(mStyle, gStyle, path) {
	// console.log(path);
	const forcePath = `force.${path}`;

	// Slow version with output (only for debugging)
	// const val1 = getNestedProperty(mStyle, forcePath);
	// const val2 = getNestedProperty(gStyle, path);
	// const val3 = getNestedProperty(mStyle, path);
	// const val4 = getNestedProperty(DEFAULTS, path);
	// console.log('FORCE: ', val1);
	// console.log('GEOJSON: ', val2);
	// console.log('FALLBACK: ', val3);
	// console.log('DEFAULT: ', val4);
	// return val1 || val2 || val3 || val4;

	// Fast version (will stop calculating as soon as truthy value is found)
	return (
		getNestedProperty(mStyle, forcePath) ||
		getNestedProperty(gStyle, path) ||
		getNestedProperty(mStyle, path) ||
		getNestedProperty(DEFAULTS, path)
	);
}

function getDash(feature, gStyle) {
	return feature.properties.is_dashed || gStyle.is_dashed ? [1, 1] : [1, 0];
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
// DEFAULTS
//////////////////////////////////////////////////////////////////////////////////////////
const DEFAULTS = {
	points: {
		type: 'circle', // 'icon' || 'circle'
		// GENERAL
		// Layout properties
		setInvisible: false,

		// CIRCLE
		circleStyle: {
			// Paint properties
			circleRadius: 10,
			circleColor: 'red',
			circleStrokeColor: 'black',
			circleStrokeWidth: 1
		},
		// ICON
		iconStyle: {
			hasIconBackdrop: false,
			// BACKDROP CIRCLE
			iconBackdropStyle: {
				// Paint properties
				setInvisible: false,
				circleRadius: 18,
				circleColor: 'white',
				circleStrokeColor: 'black',
				circleStrokeWidth: 1
			},
			// SYMBOL
			// Layout properties
			iconName: 'dot',
			iconSize: 0.02, // very much depends on the icon...
			iconAnchor: 'center',
			iconOverlap: 'cooperative',
			textField: ['get', 'comment'], //??
			textOffset: [0, 1.25],
			textAnchor: 'top'
		}
		//! TODO: Not implemented yet (many more)
		// hasGlow
	},
	lines: {
		// Glow properties (not native to maplibregl)
		hasGlow: false,
		isGlow: false, // will be set programmatically, not intended for outside use
		glowStyle: {
			lineWidthGlowFactor: 5,
			lineBlur: 5
		},
		// Layout properties
		setInvisible: false,
		lineJoin: 'round',
		lineCap: 'round',
		// Paint properties
		lineColor: 'red',
		lineWidth: 2,
		lineOpacity: 1,
		lineBlur: 0,
		lineDashArray: [1, 0]
		//! TODO: Not implemented yet (many more)
		// lineWidthArray: [0, 4, 16, 8],
		// isDotted: false
	},
	polygons: {
		// General properties
		maxZoom: 20,
		// Layout properties
		setInvisible: false,
		fillColor: 'yellow',
		fillPattern: 'dot', //null, //'red-striped-pattern'
		fillOpacity: 0.5,
		fillAntialias: true, // to be on the safe side,
		// Paint properties
		lineColor: 'darkblue',
		lineWidth: 4,
		lineOpacity: 1
		//!TODO not implemented yet
		// lineWidthZoom: [8, 0.1, 15, 6]
		// hasGlow
	}
};

//////////////////////////////////////////////////////////////////////////////////////////
// Add Layer Function
//////////////////////////////////////////////////////////////////////////////////////////
//! BEWARE: currently, what may seem as fallbacks only jumps in if no force or gStyle is provided. However, this will not help with invalid values, which may still lead to errors, or features simply not showing on the map.
// force will win over gStyle
export function addLayer(
	map,
	feature,
	FEATURES = null,
	sourceId,
	layerId,
	gStyle = {}, // styling as read from geoJSON
	mStyle = {}, // manual styling
	groupNames = []
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
	console.log('FEATURE TYPE: ', featureType);

	// ---------------------------------------------------------------------------------------
	// ADD LAYER

	// --------------------------------------
	// Points
	// --------------------------------------
	if (featureType === 'MultiPoint' || featureType === 'Point') {
		switch (coalesce(mStyle, gStyle, 'points.type')) {
			// Add simple circles
			case 'circle':
				map.addLayer({
					id: layerId,
					type: 'circle',
					source: sourceId,
					layout: {
						visibility: coalesce(mStyle, gStyle, 'points.setInvisible') ? 'none' : 'visible'
					},
					paint: {
						'circle-radius': coalesce(mStyle, gStyle, 'points.circleStyle.circleRadius'),
						'circle-color': coalesce(mStyle, gStyle, 'points.circleStyle.circleColor'),
						'circle-stroke-color': coalesce(mStyle, gStyle, 'points.circleStyle.circleStrokeColor'),
						'circle-stroke-width': coalesce(mStyle, gStyle, 'points.circleStyle.circleStrokeWidth')
					},
					filter: ['==', ['get', 'id'], feature.properties.id]
				});
				break;
			case 'icon':
				// Add backdrop circle
				if (coalesce(mStyle, gStyle, 'points.iconStyle.hasIconBackdrop')) {
					map.addLayer({
						id: `${layerId}-background`,
						type: 'circle',
						source: sourceId,
						metadata: {
							groupNames: groupNames
						},
						layout: {
							visibility: coalesce(
								mStyle,
								gStyle,
								'points.iconStyle.iconBackdropStyle.setInvisible'
							)
								? 'none'
								: 'visible'
						},
						paint: {
							'circle-radius': coalesce(
								mStyle,
								gStyle,
								'points.iconStyle.iconBackdropStyle.circleRadius'
							),
							'circle-color': coalesce(
								mStyle,
								gStyle,
								'points.iconStyle.iconBackdropStyle.circleColor'
							),
							'circle-stroke-color': coalesce(
								mStyle,
								gStyle,
								'points.iconStyle.iconBackdropStyle.circleStrokeColor'
							),
							'circle-stroke-width': coalesce(
								mStyle,
								gStyle,
								'points.iconStyle.iconBackdropStyle.circleStrokeWidth'
							)
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
						visibility: coalesce(mStyle, gStyle, 'points.setInvisible') ? 'none' : 'visible',
						'icon-image': coalesce(mStyle, gStyle, 'points.iconStyle.iconName'), // Note that icons still must be registered (added) to the map
						'icon-size': coalesce(mStyle, gStyle, 'points.iconStyle.iconSize'),
						'icon-anchor': coalesce(mStyle, gStyle, 'points.iconStyle.iconAnchor'),
						'icon-overlap': coalesce(mStyle, gStyle, 'points.iconStyle.iconOverlap'),
						'text-field': coalesce(mStyle, gStyle, 'points.iconStyle.textField'),
						'text-offset': coalesce(mStyle, gStyle, 'points.iconStyle.textOffset'),
						'text-anchor': coalesce(mStyle, gStyle, 'points.iconStyle.textAnchor')
						// 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
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
		console.log('LINE: ', mStyle?.lines);

		// CHECK GLOW AND RE-RUN addLayer
		if (coalesce(mStyle, gStyle, 'lines.hasGlow')) {
			let mStyleOfGlow = { ...mStyle }; // shallow copy is important!
			mStyleOfGlow.lines.hasGlow = false;
			mStyleOfGlow.lines.isGlow = true;

			//
			addLayer(map, feature, FEATURES, sourceId, layerId, gStyle, mStyleOfGlow, groupNames);

			// before continuing, make sure isGlow is false for normal line
			mStyle.lines.isGlow = false;
		}

		const lineWidthGlowFactor = mStyle?.lines?.isGlow
			? coalesce(mStyle, gStyle, 'lines.glowStyle.lineWidthGlowFactor')
			: 1; // set 1 for nonGlow line (note, that two lines will be added on top of each other!)
		const layerIdGlow = `${layerId}-glow`;

		map.addLayer({
			id: mStyle?.lines?.isGlow ? layerIdGlow : layerId,
			type: 'line',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				visibility: coalesce(mStyle, gStyle, 'lines.setInvisible') ? 'none' : 'visible',
				'line-join': coalesce(mStyle, gStyle, 'lines.lineJoin'),
				'line-cap': coalesce(mStyle, gStyle, 'lines.lineCap')
			},
			paint: {
				'line-color': coalesce(mStyle, gStyle, 'lines.lineColor'),
				'line-width': coalesce(mStyle, gStyle, 'lines.lineWidth') * lineWidthGlowFactor,
				//! DEBUG Mixing lineWidth with lineWidthArray will NOT work! try with nested coalesce, but I fear, this won't not work either
				// 'line-width':
				// 	(coalesce(mStyle, gStyle, 'lines.lineWidth') || [
				// 		'interpolate',
				// 		['linear'],
				// 		['zoom'],
				// 		//!? Can I spread? ...coalesce(mStyle?.lines, 'lineWidthArray') to have as many as I need?
				// 		//! -> maybe even put 'linear' and 'zoom' on [0] and [1] and start array at [2]
				// 		coalesce(mStyle, gStyle, 'lines.lineWidthArray')[0],
				// 		coalesce(mStyle, gStyle, 'lines.lineWidthArray')[1],
				// 		coalesce(mStyle, gStyle, 'lines.lineWidthArray')[2],
				// 		coalesce(mStyle, gStyle, 'lines.lineWidthArray')[3]
				// 	]) * lineWidthGlowFactor,
				'line-opacity': coalesce(mStyle, gStyle, 'lines.lineOpacity'),
				'line-blur': mStyle?.lines?.isGlow
					? coalesce(mStyle, gStyle, 'lines.glowStyle.lineBlur')
					: coalesce(mStyle, gStyle, 'lines.lineBlur'),
				'line-dasharray':
					getDash(feature, gStyle) || coalesce(mStyle, gStyle, 'lines.lineDashArray')
			},
			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// Manual Adjustments
		// Make sure glow is not dashed
		if (mStyle?.lines?.isGlow) {
			map.setPaintProperty(layerIdGlow, 'line-dasharray', null);
		}

		// PUSH TO FEATURES
		if (FEATURES) {
			if (FEATURES.allLoaded_layerIds) {
				FEATURES.allLoaded_layerIds.push(layerId);
				if (mStyle?.lines?.hasGlow) {
					const glow_id = `${layerId}-glow`;
					addLine(glow_id, true);
					FEATURES.allLoaded_layerIds.push(glow_id);
				}
			}
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
				visibility: coalesce(mStyle, gStyle, 'polygons.setInvisible') ? 'none' : 'visible'
			},
			paint: {
				'fill-color': coalesce(mStyle, gStyle, 'polygons.fillColor'),
				'fill-pattern': coalesce(mStyle, gStyle, 'polygons.fillPattern'),
				'fill-opacity': coalesce(mStyle, gStyle, 'polygons.fillOpacity'),
				'fill-antialias': coalesce(mStyle, gStyle, 'polygons.fillAntialias')
			},
			maxzoom: coalesce(mStyle, gStyle, 'polygons.maxZoom'),
			filter: ['==', ['get', 'id'], feature.properties.id]
		});

		// ContourLine
		const layerIdContour = `${layerId}-contour`;
		map.addLayer({
			id: layerIdContour,
			type: 'line',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				visibility: coalesce(mStyle, gStyle, 'polygons.setInvisible') ? 'none' : 'visible'
			},
			paint: {
				'line-color': coalesce(mStyle, gStyle, 'polygons.lineColor'),
				'line-width': coalesce(mStyle, gStyle, 'polygons.lineWidth'),
				// This won't work, see above for explanation
				// 'line-width': ['interpolate', ['linear'], ['zoom']],
				'line-opacity': coalesce(mStyle, gStyle, 'polygons.lineOpacity')
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
				'circle-color': gStyle.color || '#f30',
				'circle-opacity': 0.5
			},
			layout: {
				visibility: 'none' // Hidden by default
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
