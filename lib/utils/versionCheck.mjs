/**
## mapp.utils.versionCheck()

@module /utils/versionCheck
*/
/**
@function versionCheck
@description Compare the current version of the application with a given value. 
If the version is more than or equal to the given value, return true.
This will first compare the major version number, then the minor version number.
If the major version numbers are equal, it will compare the minor version numbers.
@param {String} value - The value to compare with the current version.
@return {boolean} - Return true if the current version is more than or equal to the given value.
*/
export function versionCheck(value) {
    // Extract the major version (first number) from the version string.
    const majorVersion = parseFloat(mapp.version.split('.')[0]);
    // Extract the minor version (second number) from the version string.
    const minorVersion = parseFloat(mapp.version.split('.')[1]);

    // Extract the major version (first number) from the value string.
    const majorcheckAgainst = parseFloat(value.toString().split('.')[0]);
    // Extract the minor version (second number) from the value string.
    const minorcheckAgainst = parseFloat(value.toString().split('.')[1]);

    // Compare the major version numbers.
    if (majorVersion > majorcheckAgainst) {
        return true;
    }
    // If major version numbers are equal, compare the minor version numbers.
    if (majorVersion === majorcheckAgainst && minorVersion >= minorcheckAgainst) {
        return true;
    }

    // If the major version number is equal, but the minor version number is less than the given value, return false.
    return false;

}