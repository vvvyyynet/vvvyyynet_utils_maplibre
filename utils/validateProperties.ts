type PropertySpec = {
  type: string | string[];
  range?: { min?: number; max?: number };
};

import {layerProperties as styleSpec} from '../layerPropertiesKebabCamelType.ts';

export function getValidValue(layer: string, property: string, value: any): any {
  // // Example usage:
  // const validValue = getValidValue("circle", "circleRadius", 50);  // { circleRadius: 50 }
  // const invalidValue = getValidValue("circle", "circleRadius", -1);  // null
  // console.log(validValue);
  // console.log(invalidValue);

  const layerSpec = styleSpec[layer];
  if (!layerSpec) {
    console.error(`Layer "${layer}" not found.`);
    return null;
  }

  // Find the property spec for the given property
  let propertySpec: PropertySpec | undefined;
  for (const category of ['layout', 'paint']) {
    if (layerSpec[category]) {
      propertySpec = layerSpec[category].find(p => p.camelCaseName === property);
      if (propertySpec) break;
    }
  }

  if (!propertySpec) {
    console.error(`Property "${property}" not found in layer "${layer}".`);
    return null;
  }

  // Validate type
  if (typeof value !== propertySpec.type && !Array.isArray(value) && typeof value !== "string") {
    console.error(`Value for "${property}" must be of type "${propertySpec.type}".`);
    return null;
  }

  // Validate range
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

  // Return the validated value
  return value;
}

