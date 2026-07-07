/**
## /utils/envReplace

@module /utils/envReplace
*/

/**
@function envReplace 
@description
This function replaces variables in src strings with their corresponding values from the xyzEnv object. The variables are denoted by the syntax ${VARIABLE_NAME}. If a variable is not found in xyzEnv, it will remain unchanged in the string.

@param {string} str The string containing template variables to be replaced.
@returns {string} The string with template variables replaced.
*/

export default function envReplace(str) {
  if (str === undefined) return;

  str = str.replace(/\$\{([A-Za-z0-9_\s]*)\}/g, (matched) => {
    // Remove template brackets from matched param.
    const param = matched.replace(/\$\{|\}/g, '');

    // Find substitute value from xyzEnv SRC_* variable.
    const change = xyzEnv[`SRC_${param}`] || matched;

    return change;
  });

  return str;
}
