/**
## mapp.utils.promiseAll{}

@module /utils/promiseAll
*/

export default (promises) =>
  new Promise((resolveAll, rejectAll) => {
    Promise.all(promises)
      .then(resolveAll)
      .catch((error) => {
        console.error(error);
        rejectAll(error);
      });
  });
