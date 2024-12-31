//////////////////////////////////////////////////////////////////////////////////////////
// DEFAULT_STYLES
//////////////////////////////////////////////////////////////////////////////////////////
export const styleset = {
	points: {
		visibilityCircle: 'visible',
		visibilitySymbols: 'none',
		setInvisible: false,

		// CIRCLES
		circleRadius: 10,
		circleColor: 'red',
		circleStrokeColor: 'black',
		circleStrokeWidth: 1,
		addBackdropCircles: false,
	
		// SYMBOLS
		iconImage: undefined,
		iconSize: 0.02, // very much depends on the icon...
		iconAnchor: 'center',
		iconOverlap: 'cooperative',
		textField: ['get', 'comment'], //??
		textOffset: [0, 1.25],
		textAnchor: 'top',
		textFont: ['Open Sans Semibold', 'Arial Unicode MS Bold'],
		
		// BACKDROP CIRCLES
		backdropCircle: {
			setInvisible: false,
			circleRadius: 18,
			circleColor: 'white',
			circleStrokeColor: 'black',
			circleStrokeWidth: 1
		}
	},
	lines: {
		setInvisible: false,
		lineJoin: 'round',
		lineCap: 'round',		
		lineColor: 'red',
		lineWidth: 4,
		lineOpacity: 1,
		lineBlur: 0,
		lineDashArray: [0,0],
		
		// Glow properties (not native to maplibregl)
		addGlow: false,
		isGlow: false, // will be set programmatically, not intended for outside use
		glow: {
			lineWidthGlowFactor: 5,
			lineBlur: 5
		}
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

	}
};
