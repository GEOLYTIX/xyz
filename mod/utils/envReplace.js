/**
@module /utils/envReplace
*/

/**
@function envReplace 
@description
The envReplace method finds occurances of ${...} in a stringified object and substitutes the template variables with values from matched process.env variables.

The template variable ${RESOURCE} will be substituted with the process.env.SRC_RESOURCE value.

Template variables not defined in the process.env will not be replaced.

@param {Obeckt} obj 
@returns {json} safeObject 
*/
module.exports = function envReplace(obj) {
  // Convert the input object to a JSON string
  const str = JSON.stringify(obj).replace(
    /\$\{([A-Za-z0-9_\s]*)\}/g,
    (matched) => {
      // Remove template brackets from matched param.
      const param = matched.replace(/\$\{|\}/g, '');

      // Find substitute value from process.env SRC_* variable.
      const change = process.env[`SRC_${param}`] || matched;

      return change;
    },
  );

  return JSON.parse(str);
};
