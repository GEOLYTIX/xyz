/**
## /utils/versionCheck

@module /utils/versionCheck
*/

/**
@function versionCheck

@description
Compare the mapp.version string property against as string value provided as argument.

The versionCheck returns true if the provided value argument equals or exceeds the mapp.version.

```js
versionCheck('4.12') //returns true with mapp.version = '4.12.0' or smaller.
```

@param {String} value The value to compare with the current version.
@return {boolean} Return true if the current version is more than or equal to the given value.
*/
export function versionCheck(value) {
  const majorVersion = parseInt(mapp.version.split('.')[0]);

  const minorVersion = parseInt(mapp.version.split('.')[1]);

  const patchVersion = parseInt(mapp.version.split('.')[2]);

  const majorValue = parseInt(value.toString().split('.')[0]);

  const minorValue = parseInt(value.toString().split('.')[1]);

  const patchValue = parseInt(value.toString().split('.')[2]) || 0;

  // The major version exceeds the value.
  if (majorVersion > majorValue) {
    return true;
  }

  // The major versions are equal.
  if (majorVersion === majorValue) {
    // The minor version exceeds the mapp.version minor.
    if (minorVersion > minorValue) return true;

    return minorVersion === minorValue && patchVersion >= patchValue;
  }

  // The value exceeds the mapp.version
  return false;
}
