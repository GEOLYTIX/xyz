/**
## mapp.utils.promiseAll{}

@module /utils/promiseAll
*/

/**
@function promiseAll

@description
Resolves with the values of all promises like Promise.all(). The error of a rejected promise is logged before the returned promise rejects.

@param {Array<Promise>} promises The promises.
@returns {Promise<Array>} The values of the promises.
*/
export default function promiseAll(promises) {
  return new Promise((resolveAll, rejectAll) => {
    Promise.all(promises)
      .then(resolveAll)
      .catch((error) => {
        console.error(error);
        rejectAll(error);
      });
  });
}
