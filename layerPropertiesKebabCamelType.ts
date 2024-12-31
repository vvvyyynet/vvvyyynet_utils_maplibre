export const layerProperties = {
	background: {
		layout: [
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'background-color',
				camelCaseName: 'backgroundColor',
				type: 'string'
			},
			{
				name: 'background-pattern',
				camelCaseName: 'backgroundPattern',
				type: 'string | null'
			},
			{
				name: 'background-opacity',
				camelCaseName: 'backgroundOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			}
		]
	},
	fill: {
		layout: [
			{
				name: 'fill-sort-key',
				camelCaseName: 'fillSortKey',
				type: 'string | number'
			},
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'fill-antialias',
				camelCaseName: 'fillAntialias',
				type: 'boolean'
			},
			{
				name: 'fill-opacity',
				camelCaseName: 'fillOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'fill-color',
				camelCaseName: 'fillColor',
				type: 'string'
			},
			{
				name: 'fill-outline-color',
				camelCaseName: 'fillOutlineColor',
				type: 'string | null'
			},
			{
				name: 'fill-translate',
				camelCaseName: 'fillTranslate',
				type: 'number[]'
			},
			{
				name: 'fill-translate-anchor',
				camelCaseName: 'fillTranslateAnchor',
				type: "'map' | 'viewport'"
			},
			{
				name: 'fill-pattern',
				camelCaseName: 'fillPattern',
				type: 'string | null'
			}
		]
	},
	circle: {
		layout: [
			{
				name: 'circle-sort-key',
				camelCaseName: 'circleSortKey',
				type: 'string | number'
			},
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'circle-radius',
				camelCaseName: 'circleRadius',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'circle-color',
				camelCaseName: 'circleColor',
				type: 'string'
			},
			{
				name: 'circle-blur',
				camelCaseName: 'circleBlur',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'circle-opacity',
				camelCaseName: 'circleOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'circle-translate',
				camelCaseName: 'circleTranslate',
				type: 'number[]'
			},
			{
				name: 'circle-translate-anchor',
				camelCaseName: 'circleTranslateAnchor',
				type: "'map' | 'viewport'"
			},
			{
				name: 'circle-pitch-scale',
				camelCaseName: 'circlePitchScale',
				type: "'map' | 'viewport'"
			},
			{
				name: 'circle-pitch-alignment',
				camelCaseName: 'circlePitchAlignment',
				type: "'auto' | 'viewport' | 'map'"
			},
			{
				name: 'circle-stroke-width',
				camelCaseName: 'circleStrokeWidth',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'circle-stroke-color',
				camelCaseName: 'circleStrokeColor',
				type: 'string'
			},
			{
				name: 'circle-stroke-opacity',
				camelCaseName: 'circleStrokeOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			}
		]
	},
	heatmap: {
		layout: [
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'heatmap-radius',
				camelCaseName: 'heatmapRadius',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'heatmap-weight',
				camelCaseName: 'heatmapWeight',
				type: 'number'
			},
			{
				name: 'heatmap-intensity',
				camelCaseName: 'heatmapIntensity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'heatmap-color',
				camelCaseName: 'heatmapColor',
				type: 'string'
			},
			{
				name: 'heatmap-opacity',
				camelCaseName: 'heatmapOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			}
		]
	},
	'fill-extrusion': {
		layout: [
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'fill-extrusion-opacity',
				camelCaseName: 'fillExtrusionOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'fill-extrusion-color',
				camelCaseName: 'fillExtrusionColor',
				type: 'string'
			},
			{
				name: 'fill-extrusion-translate',
				camelCaseName: 'fillExtrusionTranslate',
				type: 'number[]'
			},
			{
				name: 'fill-extrusion-translate-anchor',
				camelCaseName: 'fillExtrusionTranslateAnchor',
				type: "'map' | 'viewport'"
			},
			{
				name: 'fill-extrusion-pattern',
				camelCaseName: 'fillExtrusionPattern',
				type: 'string | null'
			},
			{
				name: 'fill-extrusion-height',
				camelCaseName: 'fillExtrusionHeight',
				type: 'number'
			},
			{
				name: 'fill-extrusion-base',
				camelCaseName: 'fillExtrusionBase',
				type: 'number'
			},
			{
				name: 'fill-extrusion-vertical-gradient',
				camelCaseName: 'fillExtrusionVerticalGradient',
				type: 'boolean'
			}
		]
	},
	line: {
		layout: [
			{
				name: 'line-cap',
				camelCaseName: 'lineCap',
				type: "'butt' | 'round' | 'square'"
			},
			{
				name: 'line-join',
				camelCaseName: 'lineJoin',
				type: "'bevel' | 'round' | 'miter'"
			},
			{
				name: 'line-miter-limit',
				camelCaseName: 'lineMiterLimit',
				type: 'number'
			},
			{
				name: 'line-round-limit',
				camelCaseName: 'lineRoundLimit',
				type: 'number'
			},
			{
				name: 'line-sort-key',
				camelCaseName: 'lineSortKey',
				type: 'string | number'
			},
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'line-opacity',
				camelCaseName: 'lineOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'line-color',
				camelCaseName: 'lineColor',
				type: 'string'
			},
			{
				name: 'line-translate',
				camelCaseName: 'lineTranslate',
				type: 'number[]'
			},
			{
				name: 'line-translate-anchor',
				camelCaseName: 'lineTranslateAnchor',
				type: "'map' | 'viewport'"
			},
			{
				name: 'line-width',
				camelCaseName: 'lineWidth',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'line-gap-width',
				camelCaseName: 'lineGapWidth',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'line-offset',
				camelCaseName: 'lineOffset',
				type: 'number'
			},
			{
				name: 'line-blur',
				camelCaseName: 'lineBlur',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'line-dasharray',
				camelCaseName: 'lineDasharray',
				type: 'number[]'
			},
			{
				name: 'line-pattern',
				camelCaseName: 'linePattern',
				type: 'string | null'
			},
			{
				name: 'line-gradient',
				camelCaseName: 'lineGradient',
				type: 'string'
			}
		]
	},
	symbol: {
		layout: [
			{
				name: 'symbol-placement',
				camelCaseName: 'symbolPlacement',
				type: "'point' | 'line'"
			},
			{
				name: 'symbol-spacing',
				camelCaseName: 'symbolSpacing',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'symbol-avoid-edges',
				camelCaseName: 'symbolAvoidEdges',
				type: 'boolean'
			},
			{
				name: 'symbol-sort-key',
				camelCaseName: 'symbolSortKey',
				type: 'number'
			},
			{
				name: 'symbol-z-order',
				camelCaseName: 'symbolZOrder',
				type: "'auto' | 'viewport-y'"
			}
		],
		paint: [
			{
				name: 'icon-allow-overlap',
				camelCaseName: 'iconAllowOverlap',
				type: 'boolean'
			},
			{
				name: 'icon-overlap',
				camelCaseName: 'iconOverlap',
				type: 'boolean'
			},
			{
				name: 'icon-ignore-placement',
				camelCaseName: 'iconIgnorePlacement',
				type: 'boolean'
			},
			{
				name: 'icon-optional',
				camelCaseName: 'iconOptional',
				type: 'boolean'
			},
			{
				name: 'icon-rotation-alignment',
				camelCaseName: 'iconRotationAlignment',
				type: "'map' | 'viewport' | 'auto'"
			},
			{
				name: 'icon-size',
				camelCaseName: 'iconSize',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'icon-text-fit',
				camelCaseName: 'iconTextFit',
				type: "'none' | 'width' | 'both'"
			},
			{
				name: 'icon-text-fit-padding',
				camelCaseName: 'iconTextFitPadding',
				type: 'number[]'
			},
			{
				name: 'icon-image',
				camelCaseName: 'iconImage',
				type: 'string'
			},
			{
				name: 'icon-rotate',
				camelCaseName: 'iconRotate',
				type: 'number'
			},
			{
				name: 'icon-padding',
				camelCaseName: 'iconPadding',
				type: 'number'
			},
			{
				name: 'icon-keep-upright',
				camelCaseName: 'iconKeepUpright',
				type: 'boolean'
			},
			{
				name: 'icon-offset',
				camelCaseName: 'iconOffset',
				type: 'number[]'
			},
			{
				name: 'icon-anchor',
				camelCaseName: 'iconAnchor',
				type: "'center' | 'left' | 'right' | 'top' | 'bottom'"
			},
			{
				name: 'icon-pitch-alignment',
				camelCaseName: 'iconPitchAlignment',
				type: "'map' | 'viewport'"
			},
			{
				name: 'text-pitch-alignment',
				camelCaseName: 'textPitchAlignment',
				type: "'map' | 'viewport'"
			},
			{
				name: 'text-rotation-alignment',
				camelCaseName: 'textRotationAlignment',
				type: "'map' | 'viewport' | 'auto'"
			},
			{
				name: 'text-field',
				camelCaseName: 'textField',
				type: 'string | expression'
			},
			{
				name: 'text-font',
				camelCaseName: 'textFont',
				type: 'string[]'
			},
			{
				name: 'text-size',
				camelCaseName: 'textSize',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'text-max-width',
				camelCaseName: 'textMaxWidth',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'text-line-height',
				camelCaseName: 'textLineHeight',
				type: 'number'
			},
			{
				name: 'text-letter-spacing',
				camelCaseName: 'textLetterSpacing',
				type: 'number'
			},
			{
				name: 'text-justify',
				camelCaseName: 'textJustify',
				type: "'left' | 'center' | 'right'"
			},
			{
				name: 'text-radial-offset',
				camelCaseName: 'textRadialOffset',
				type: 'number'
			},
			{
				name: 'text-variable-anchor',
				camelCaseName: 'textVariableAnchor',
				type: "'top' | 'bottom' | 'left' | 'right'"
			},
			{
				name: 'text-variable-anchor-offset',
				camelCaseName: 'textVariableAnchorOffset',
				type: 'number[]'
			},
			{
				name: 'text-anchor',
				camelCaseName: 'textAnchor',
				type: "'center' | 'left' | 'right' | 'top' | 'bottom'"
			},
			{
				name: 'text-max-angle',
				camelCaseName: 'textMaxAngle',
				type: 'number',
				range: { min: 0, max: 45 }
			},
			{
				name: 'text-writing-mode',
				camelCaseName: 'textWritingMode',
				type: "'horizontal' | 'vertical'"
			},
			{
				name: 'text-rotate',
				camelCaseName: 'textRotate',
				type: 'number'
			},
			{
				name: 'text-padding',
				camelCaseName: 'textPadding',
				type: 'number'
			},
			{
				name: 'text-keep-upright',
				camelCaseName: 'textKeepUpright',
				type: 'boolean'
			},
			{
				name: 'text-transform',
				camelCaseName: 'textTransform',
				type: "'none' | 'uppercase' | 'lowercase'"
			},
			{
				name: 'text-offset',
				camelCaseName: 'textOffset',
				type: 'number[]'
			},
			{
				name: 'text-allow-overlap',
				camelCaseName: 'textAllowOverlap',
				type: 'boolean'
			},
			{
				name: 'text-overlap',
				camelCaseName: 'textOverlap',
				type: "'always' | 'false' | 'never'"
			},
			{
				name: 'text-ignore-placement',
				camelCaseName: 'textIgnorePlacement',
				type: 'boolean'
			},
			{
				name: 'text-optional',
				camelCaseName: 'textOptional',
				type: 'boolean'
			},
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		]
	},
	raster: {
		layout: [
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'raster-opacity',
				camelCaseName: 'rasterOpacity',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'raster-hue-rotate',
				camelCaseName: 'rasterHueRotate',
				type: 'number',
				range: { min: -360, max: 360 }
			},
			{
				name: 'raster-brightness-min',
				camelCaseName: 'rasterBrightnessMin',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'raster-brightness-max',
				camelCaseName: 'rasterBrightnessMax',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'raster-saturation',
				camelCaseName: 'rasterSaturation',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'raster-contrast',
				camelCaseName: 'rasterContrast',
				type: 'number',
				range: { min: 0, max: 1 }
			},
			{
				name: 'raster-resampling',
				camelCaseName: 'rasterResampling',
				type: "'nearest' | 'bilinear' | 'cubic'"
			},
			{
				name: 'raster-fade-duration',
				camelCaseName: 'rasterFadeDuration',
				type: 'number'
			}
		]
	},
	hillshade: {
		layout: [
			{
				name: 'visibility',
				camelCaseName: 'visibility',
				type: "'visible' | 'none'"
			}
		],
		paint: [
			{
				name: 'hillshade-illumination-direction',
				camelCaseName: 'hillshadeIlluminationDirection',
				type: 'number',
				range: { min: 0, max: 360 }
			},
			{
				name: 'hillshade-illumination-anchor',
				camelCaseName: 'hillshadeIlluminationAnchor',
				type: "'map' | 'viewport'"
			},
			{
				name: 'hillshade-exaggeration',
				camelCaseName: 'hillshadeExaggeration',
				type: 'number',
				range: { min: 0 }
			},
			{
				name: 'hillshade-shadow-color',
				camelCaseName: 'hillshadeShadowColor',
				type: 'string'
			},
			{
				name: 'hillshade-highlight-color',
				camelCaseName: 'hillshadeHighlightColor',
				type: 'string'
			},
			{
				name: 'hillshade-accent-color',
				camelCaseName: 'hillshadeAccentColor',
				type: 'string'
			}
		]
	}
};