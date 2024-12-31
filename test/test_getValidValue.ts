import {getValidValue} from '../utils/validateProperties'

export function test_getValidValue(){

  const validValue = getValidValue("circle", "circleRadius", 50);  // { circleRadius: 50 }
  console.log(validValue); // { circleRadius: 50 }

  const invalidValue = getValidValue("circle", "circleRadius", -1);  // null
  console.log(invalidValue); // null
}