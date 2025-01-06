// Interfaces for nested array (type-safe specification)
type PropertySpec = {
	name: string;
	camelCaseName: string;
	type: string;
	range?: { min?: number; max?: number };
};

import { layerProperties as styleSpec } from '../layerPropertiesKebabCamelType.ts';

export function getValidValue(path: string, propertyName: string, value: any): any {
	// Input variables
	// path:string (multi-part paths must be '.' separated)
	// propertyName:string (use camelCase)
	// value:any

	// Example usage:
	// const validValue = getValidValue("circle.paint", "circleRadius", 50);  // { circleRadius: 50 }
	// const invalidValue = getValidValue("circle.paint", "circleRadius", -1);  // null
	// console.log(validValue);
	// console.log(invalidValue);

	// Skip validation for falsy values
	if (value === null || value === undefined) {
		return value;
	}

	// export const function getPropertySpec(path, propertyName){

		// Extract the nested propertyName using path.
		const layerSpec:PropertySpec|undefined = path
		.split('.')
		.reduce((obj:any, key) => (obj ? obj[key] : undefined), styleSpec)
		
		// If the result is iterable, search for the specific camelCaseName
		let propertySpec:PropertySpec|undefined
		if (Array.isArray(layerSpec)) {
			propertySpec = layerSpec.find((p: PropertySpec) => p.camelCaseName === propertyName)
		}
		
		// Return, if propertyName is not found in the styleSpec under the given path
		if (!propertySpec) {
			console.error(`Property "${propertyName}" could not be found in "${path}".`);
			return null;
		} else {
			return propertySpec
		}
	// }

	// ---------------------------------------------------------------------------------------------------------
	// Invalidation Checks
	// ---------------------------------------------------------------------------------------------------------
	// ---------------------
	// ARRAY OF STRINGS
	if (propertySpec.type === 'string[]') {
		// 
		//! TODO
		// 
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
				`Value for "${propertyName}" must be of type "${propertySpec.type}", found '${value}'`
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
				console.error(`Value for "${propertyName}" must be >= ${propertySpec.range.min}.`);
				return null;
			}
			if (propertySpec.range.max !== undefined && value > propertySpec.range.max) {
				console.error(`Value for "${propertyName}" must be <= ${propertySpec.range.max}.`);
				return null;
			}
		}

		// ---------------------
		// BOOLEANS
	} else if (propertySpec.type === 'boolean') {
		//
		//! TODO
		//
		// ---------------------
		// COLORS
	} else if (propertySpec.type === 'color') {
		//
		//! TODO
		//
	} else {
		//
		//! TODO some error
		//
		return null;
	}

	// ---------------------------------------------------------------------------------------------------------
	// Return the validated value (since all invalidation attempts failed)
	// ---------------------------------------------------------------------------------------------------------
	return value;
}
