/**
## mapp.utils.versionCheck()

@module /utils/versionCheck
*/
/**
@function versionCheck
@description Compare the current version of the application with a given value. 
If the version is more than or equal to the given value, return true.
@param {String} value - The value to compare with the current version. This is allowed to be a string or number, but it will be converted to a number for comparison.
@return {boolean} - Return true if the current version is more than or equal to the given value.
*/
export function versionCheck(value)  {
    // Regex to remove all dots from the version string e.g. '5.0.0' -> 500
    const checkAgainst = parseFloat(String(value).replace(/\./g, ''));

    const version = parseFloat(mapp.version.replace(/\./g, ''));
    
    // If version is more than or equal to checkAgainst return true.
    return version >= checkAgainst;

}