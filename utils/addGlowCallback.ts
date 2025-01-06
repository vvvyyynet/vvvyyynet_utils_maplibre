import { setNested } from './general_utils';

function tweakGlowStyle(styleset, type, pathSuffix) {
	// All replacements will happen on a styleset level.
	// Input: type = 'lines' or 'polygons'

	// ----------------------
	// minzoom and maxzoom
	// ----------------------
	// If glow.minzoom (glow.maxzoom) is unset, make sure it has the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.[pathSuffix]?.minzoom) {
		//!! (testing for styleset?.[type]) is important, if styleset={})
		setNested(styleset?.[type], `${pathSuffix}.minzoom`, styleset?.[type]?.minzoom);
	}
	if (styleset?.[type] && !styleset?.[type]?.[pathSuffix]?.maxzoom) {
		setNested(styleset?.[type], `${pathSuffix}.maxzoom`, styleset?.[type]?.maxzoom);
	}

	// ----------------------
	// lineCap and lineJoin
	// ----------------------
	// If glow.lineCap (glow.lineJoin) is unset, make sure it has the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.[pathSuffix]?.lineJoin) {
		//!! (testing for styleset?.[type]) is important, if styleset={})
		setNested(styleset?.[type], `${pathSuffix}.lineJoin`, styleset?.[type]?.lineJoin);
	}
	if (styleset?.[type] && !styleset?.[type]?.[pathSuffix]?.lineCap) {
		setNested(styleset?.[type], `${pathSuffix}.lineCap`, styleset?.[type]?.lineCap);
	}

	// ----------------------
	// lineWidth
	// ----------------------
	// Multiply the lineWidth of glow in a styleset by the lineWidthGlowFactor in the same styleset
	// only overwrite, if lineWidth is not set manually
	if (!styleset?.[type]?.[pathSuffix]?.lineWidth) {
		// try-catch makes it easier to escape non-existing style-paths or invalid values (e.g. multiplication by a String etc.)
		try {
			let lineWidth = JSON.parse(JSON.stringify(styleset[type])).lineWidth; // Deep copy

			if (typeof lineWidth == 'number') {
				setNested(
					styleset?.[type],
					`${pathSuffix}.lineWidth`,
					styleset?.[type].lineWidth * styleset?.[type]?.[pathSuffix].lineWidthGlowFactor
				);
			} else if (Array.isArray(lineWidth) && lineWidth[0] === 'interpolate') {
				// Indices to multiply: 4, 6, 8, 10, ...
				for (let i = 0; i < lineWidth.length; i++) {
					if (i >= 4 && i % 2 === 0) {
						lineWidth[i] *= styleset?.[type]?.[pathSuffix].lineWidthGlowFactor;
					}
				}
				setNested(styleset?.[type], `${pathSuffix}.lineWidth`, lineWidth);
			}
		} catch (error) {
			// console.warn(error);
		}
	}
	return styleset;
}

export const addGlowCallback = (
	map: object,
	layerType: string,
	stylesetPath: string,
	layerId: string,
	pathsID: string[],
	{
		prefix = '',
		suffix = 'lineGlow',
		seperator = '-',
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
		filterId = undefined,
		pathsCB = undefined,
		collCallbacks = undefined
	}
) => {
	// console.log('CALLING B:', map, layerType, stylesetPath, layerId, pathsID);
	// console.log('CALLING BACK from layer: ', layerType, stylesetPath, layerId);
	if (layerType === 'line') {
		if (c(stylesetPath, 'addLineGlow', null, { forceSkipValidation: true })) {
			// Define pathSuffix used in stylesets
			const pathSuffix = 'lineGlow';

			// Tweak stylesets
			collStyleset = tweakGlowStyle(collStyleset, stylesetPath, pathSuffix);
			collStyleset.force = tweakGlowStyle(collStyleset.force, stylesetPath, pathSuffix);
			featStyleset = tweakGlowStyle(featStyleset, stylesetPath, pathSuffix);
			presetStyleset = tweakGlowStyle(presetStyleset, stylesetPath, pathSuffix);

			// Adapt layerId and path
			//!TODO softcode this
			layerId = [prefix, layerId, suffix].filter(Boolean).join(seperator);
			stylesetPath = [stylesetPath, pathSuffix].join('.');

			// Add Layer
			console.log('ADDING GLOWW: ', layerId, stylesetPath, collCallbacks);
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
				{}
			));

			// push modified IDs to IdCollector
			pathsID = [
				'all',
				...pathsID
					.filter((path) => path.split('.').pop() === 'lines')
					.map((path) => `${path}_lineGlows`)
			];
			pushToIdCollector(idCollector, layerId, pathsID);
		}
	}
	// makeLayerInteractive(map, layerId);
};

// ---------------------------------------------------------------------------------------
// TRYING TO PASS ARGUMENTS TO CALLBACK-FUNCTION WITHOUT REPEATING MAP etc.
// ---------------------------------------------------------------------------------------
export function addGlowCallback2({ prefix = '', suffix = 'glow', seperator = '-' }) {
	return (
		map: object,
		layerType: string,
		stylesetPath: string,
		layerId: string,
		pathsID: string[],
		{
			prefix: prefix,
			suffix: suffix,
			seperator: seperator,
			c,
			pushToIdCollector,
			idCollector,
			addLayer,
			executeCallbacks,
			collStyleset,
			featStyleset,
			presetStyleset,
			sourceId,
			groupNames,
			filterId,
			pathsCB,
			collCallbacks
		}
	) => {
		// console.log('CALLING B');
		// console.log('CALLING BACK from layer: ', layerType, stylesetPath, layerId);
		if (layerType === 'line') {
			if (c(stylesetPath, 'addGlow', null, { forceSkipValidation: true })) {
				// Tweak lineWidth for glow in all stylesets
				collStyleset = tweakGlowStyle(collStyleset, stylesetPath);
				collStyleset.force = tweakGlowStyle(collStyleset.force, stylesetPath);
				featStyleset = tweakGlowStyle(featStyleset, stylesetPath);
				presetStyleset = tweakGlowStyle(presetStyleset, stylesetPath);

				layerId = [prefix, layerId, suffix].filter(Boolean).join(seperator);
				stylesetPath = `${stylesetPath}.backdrop`;

				// Add Layer
				// console.log('ADDING GLOWW: ', prefix, suffix, layerId, stylesetPath, collCallbacks);
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
					{}
				));
				// executeCallbacks(collCallbacks, map, layerId, pathsCB);
				pushToIdCollector(idCollector, layerId, pathsID);
			}
		}
		// makeLayerInteractive(map, layerId);
	};
}
