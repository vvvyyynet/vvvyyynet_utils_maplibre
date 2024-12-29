//////////////////////////////////////////////////////////////////////////////////////////
// DEFAULT_STYLES
//////////////////////////////////////////////////////////////////////////////////////////
export const styleset = {
	points: {
		type: 'circle', // 'icon' || 'circle'
		// GENERAL
		// Layout properties
		setInvisible: false,

		// CIRCLE
		circle: {
			// Paint properties
			circleRadius: 10,
			circleColor: 'red',
			circleStrokeColor: 'black',
			circleStrokeWidth: 1
		},
		// ICON
		icon: {
			hasIconBackdrop: false,
			// BACKDROP CIRCLE
			backdrop: {
				// Paint properties
				setInvisible: false,
				circleRadius: 18,
				circleColor: 'white',
				circleStrokeColor: 'black',
				circleStrokeWidth: 1
			},
			// SYMBOL
			// Layout properties
			iconImage: undefined,
			iconSize: 0.02, // very much depends on the icon...
			iconAnchor: 'center',
			iconOverlap: 'cooperative',
			textField: ['get', 'comment'], //??
			textOffset: [0, 1.25],
			textAnchor: 'top',
			textFont: ['Open Sans Semibold', 'Arial Unicode MS Bold']
		}
		//! TODO: Not implemented yet (many more)
		// hasGlow
	},
	lines: {
		// Layout properties
		setInvisible: false,
		lineJoin: 'round',
		lineCap: 'round',
		
		// Paint properties
		lineColor: 'red',
		lineWidth: 4,
		lineOpacity: 1,
		lineBlur: 0,
		lineDashArray: [0,0],
		
		// Glow properties (not native to maplibregl)
		hasGlow: false,
		isGlow: false, // will be set programmatically, not intended for outside use
		glow: {
			lineWidthGlowFactor: 5,
			lineBlur: 5
		},

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
		fillPattern: undefined,
		fillOpacity: 0.5,
		fillAntialias: true, // to be on the safe side,
		// Paint properties
		lineColor: 'darkblue',
		lineWidth: 4,
		lineOpacity: 1,
		lineBlur: 0,
		lineDashArray: [0,0],
				//!TODO not implemented yet
		// lineWidthZoom: [8, 0.1, 15, 6]
		// hasGlow
	}
};
