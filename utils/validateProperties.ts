// Interfaces for nested array (type-safe specification)
type PropertySpec = {
	name: string;
	camelCaseName: string;
	type: string;
	range?: { min: number; max: number };
};

// Enums for properties with specific known values
const EVisibility = ['visible', 'none'] as const;

import { layerProperties as styleSpec } from '../layerPropertiesKebabCamelType.ts';

export function getValidValue<T>(layer: string, property: string, value: any): any {
	// // Example usage:
	// const validValue = getValidValue("circle", "circleRadius", 50);  // { circleRadius: 50 }
	// const invalidValue = getValidValue("circle", "circleRadius", -1);  // null
	// console.log(validValue);
	// console.log(invalidValue);

	// Skip validation for falsy values
	if (value === null || value === undefined) {
		return value;
	}

	// Find the property spec for the given layer.property
	let propertySpec: PropertySpec | undefined;
	for (const cat of ['layout', 'paint']) {
		if (styleSpec?.[layer][cat]) {
			propertySpec = styleSpec?.[layer][cat].find((p) => p.camelCaseName === property);
			if (propertySpec) break;
		} else {
			// Return, if not found
			console.error(
				`Property "${property}" could not be found in "${layer}.layout" and "${layer}.paint".`
			);
			return null;
		}
	}

	if (!propertySpec) {
		console.error(
			`Property "${property}" could not be found in "${layer}.layout" and "${layer}.paint".`
		);
		return null;
	}
	// ---------------------
	// ARRAY OF STRINGS
	// ---------------------
	if (propertySpec.type === 'string[]') {
		//! TODO
		// ---------------------
		// ANY STRING
	} else if (propertySpec.type === 'string') {
		// Invalidate not a string
		if (typeof value !== 'string') {
			return null;
		}

		// ---------------------
		// SPECIFIC STRINGS
	} else if (
		['|', '"', "'"].every((string) => {
			propertySpec.type.includes(string);
		})
	) {
		// If [|,",'] are all included, this means that there is an enum of strings
		//! DEBUG: DANGER!! This is a hacky solution that does not hold for all spec (will especially break in mixed cases!!) Rather split by | and then continue...

		// Invalidate if value is not contained in any of the enum strings
		if (
			!propertySpec.type.split('|').some((allowString) => {
				return value == allowString.trim().slice(1, -1);
			})
		) {
			console.error(
				`Value for "${property}" must be of type "${propertySpec.type}", found '${value}'`
			);
			return null;
		}

		// ---------------------
		// NUMBERS
		// ---------------------
	} else if (propertySpec.type === 'number') {
		// Invalidate not a number
		if (typeof value !== 'number') {
			return null;
		}
		// Invalidate range
		if (propertySpec.range) {
			if (propertySpec.range.min !== undefined && value < propertySpec.range.min) {
				console.error(`Value for "${property}" must be >= ${propertySpec.range.min}.`);
				return null;
			}
			if (propertySpec.range.max !== undefined && value > propertySpec.range.max) {
				console.error(`Value for "${property}" must be <= ${propertySpec.range.max}.`);
				return null;
			}
		}

		// ---------------------
		// BOOLEANS
		// ---------------------
	} else if (propertySpec.type === 'boolean') {
		// ---------------------
		// COLORS
		// ---------------------
	} else if (propertySpec.type === 'color') {
		//! TODO
	} else {
		//! TODO some error
		return null;
	}

	// Return the validated value (since all invalidation attempts failed)
	return value;
}
