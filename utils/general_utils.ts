export function setNested(base: any, path: string, value: any) {
	return path.split('.').reduce((accObject, key, idx, arr) => {
		// Ensure the intermediate keys are objects or arrays
		if (
			idx < arr.length - 1 &&
			accObject[key] !== undefined &&
			typeof accObject[key] !== 'object'
		) {
			console.warn(
				`Prevented from overwriting ${path} at '${arr
					.slice(0, idx + 1)
					.join('.')}' because the value is not an object (value is ${typeof accObject[key]})`
			);
			return accObject; // Exit early without changing the object
		}

		// Initialize the key as an empty object if it's the intermediate part of the path
		accObject[key] = idx === arr.length - 1 ? value : accObject[key] || {};

		return accObject[key]; // Continue with the next level of the path
	}, base);
}

export function pushToNested(base: any, path: string, value: any) {
	// Skip if base is undefined
	// if (base === undefined) {
	// 	console.warn(`Cannot push ${value} to base.${path} because base is undefined`);
	// 	return base;
	// }

	// Push value to base.[...path]
	return path.split('.').reduce((accObject, key, idx, arr) => {
		// Case 1: If it's the final key (end of the path)
		if (idx === arr.length - 1) {
			// If the current key's value is not an array, ensure it's an array and push the value
			if (Array.isArray(accObject[key])) {
				// If it's already an array, push the value
				accObject[key].push(value);
			} else if (!accObject[key]) {
				// If it's falsy
				accObject[key] = [value];
			} else {
				// If it's a primitive (string, number, etc.), do not modify it
				console.warn(
					`Expected an array at '${arr.join('.')}', found: ${
						accObject[key]
					}. Continued without changes.`
				);
				return accObject; // Early exit without making changes
			}
		} else if (idx < arr.length - 1) {
			// Case 2: Ensure intermediate keys are objects and create them if necessary
			accObject[key] = accObject[key] || {};
		}

		return accObject[key]; // Continue navigating through the path
	}, base);
}

export function getNested(base: any, path: string): any {
	return path
		.split('.')
		.reduce((accObject, key) => (accObject?.[key] ? accObject[key] : undefined), base);
}
