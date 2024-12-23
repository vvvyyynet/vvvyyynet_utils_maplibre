//----------------------------------------------
// Waiting for Map Queue
export function waitForStyleLoad(map) {
	// console.log('WAITING FOR STYLE LOAD');
	return new Promise((resolve, reject) => {
		if (map.isStyleLoaded()) {
			// console.log('RESOLVING');
			resolve(); // Style is already loaded, resolve immediately
		} else {
			// Check repeatedly if style is loaded
			const checkStyleLoad = () => {
				if (map.isStyleLoaded()) {
					resolve(); // Style loaded, resolve the promise
				} else {
					// Retry after a short delay
					// console.log('RETRY');
					setTimeout(checkStyleLoad, 100); // Adjust interval as needed
				}
			};
			checkStyleLoad();
		}
	});
}
