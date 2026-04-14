/**
## /utils/compose

The compose module exports a utility method allowing to compose functions.

Function composition allows to expand function logic by inheriting the product of an existing function in a composition.

A function can be composed into itself by binding the original method.

Each function in the composition must accept and return 1 argument which is passed left to right through the composition.

For example the [mapp.layer.decorate(layer)]{@link module:/layer/decorate~decorate} method accepts a JSON layer and returns a promise which resolves into a decorated layer object. We can compose this method with a second method which awaits layer decorator and logs the decorated layer to the console.

```js
async function logLayer(layer) {
  await layer
  console.log(layer)
}

mapp.layer.decorate = mapp.utils.compose(
  mapp.layer.decorate.bind(),
  logLayer)
```

@module /utils/compose
*/

/**
@function compose

@description
The compose method reduces an array of n Function arguments which are spread into the fns array.

An arrow method which provides the argument provided to the first method in the function composition is provided as initial value to the Array.reduce of functions. Each function is executed in the order of the fns array. The return of any function in the composition is provided as argument to the next function [fn].

@returns {*} The single argument passed through all functions in composition.
*/
export default function compose(...fns) {
  // reduce the spread functions to execute in succession.
  return (arg) =>
    fns.reduce((acc, fn) => {
      // Execute function with reduce accumulator as only argument.
      return fn(acc);

      // Provide argument as initial value to the reduce function
    }, arg);
}
