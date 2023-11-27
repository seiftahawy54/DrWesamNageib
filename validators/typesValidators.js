/**
 * Request Input Validation
 * @module
 */

const BOOLEAN_TYPE = "boolean";
const STRING_TYPE = "string";
const NUMBER_TYPE = "number";
const OBJECT_TYPE = "object";
const ARRAY_TYPE = "array";
const ANY_TYPE = "";

/**
 *
 * @param {*} input - Input for which to return the type
 * @returns {string} - The type for the input variable
 */
function getType(input) {
  return Array.isArray(input) ? "array" : typeof input;
}

/**
 *
 * @param {*} input - parameter for which the function will check for existence and type
 * @param {string} inputName - Input name to return in error message in case there is any
 * @param {'string' | 'object'} type - Type or array of types to accept. If ANY_TYPE the function
 * will only check for the existence of the input parameter
 * @returns {object} - {
 * error: boolean determining if the input is not valid,
 * message: reason why input is invalid in case error is true
 * }
 */
function validateRequestInput(input, inputName, type) {
  // == null checks for both undefined or null values
  if (input == null)
    return {
      error: true,
      message: `error in ${inputName}`,
    };
  if (type === ANY_TYPE) return { error: false };
  if (Array.isArray(type) && !type.includes(getType(input)))
    return {
      error: true,
      message: `wrong input ${inputName} of type ${type}`,
    };
  if (!Array.isArray(type) && getType(input) !== type)
    return {
      error: true,
      message: `wrong input ${inputName} of type ${type}`,
    };
  return { error: false };
}

export {
  BOOLEAN_TYPE,
  STRING_TYPE,
  NUMBER_TYPE,
  OBJECT_TYPE,
  ARRAY_TYPE,
  ANY_TYPE,
  validateRequestInput,
};
