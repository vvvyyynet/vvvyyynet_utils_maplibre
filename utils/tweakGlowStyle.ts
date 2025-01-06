import { setNested } from './general_utils';

export function tweakGlowStyle(styleset, type) {
	// All replacements will happen on a styleset level.
	// Input: type = 'lines' or 'polygons'

	// ----------------------
	// minzoom and maxzoom
	// ----------------------
	// If glow.minzoom (glow.maxzoom) is unset, make sure it has the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.glow?.minzoom) {
		//!! (testing for styleset?.[type]) is important, if styleset={})
		setNested(styleset?.[type], 'glow.minzoom', styleset?.[type]?.minzoom);
	}
	if (styleset?.[type] && !styleset?.[type]?.glow?.maxzoom) {
		setNested(styleset?.[type], 'glow.maxzoom', styleset?.[type]?.maxzoom);
	}

	// ----------------------
	// lineCap and lineJoin
	// ----------------------
	// If glow.lineCap (glow.lineJoin) is unset, make sure it has the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.glow?.lineJoin) {
		//!! (testing for styleset?.[type]) is important, if styleset={})
		setNested(styleset?.[type], 'glow.lineJoin', styleset?.[type]?.lineJoin);
	}
	if (styleset?.[type] && !styleset?.[type]?.glow?.lineCap) {
		setNested(styleset?.[type], 'glow.lineCap', styleset?.[type]?.lineCap);
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
				setNested(
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
				setNested(styleset?.[type], 'glow.lineWidth', lineWidth);
			}
		} catch (error) {
			// console.warn(error);
		}
	}
	return styleset;
}