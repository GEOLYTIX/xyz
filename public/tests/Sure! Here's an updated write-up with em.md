# 🐶 Add Layer Test Suite 🧪

## 📝 Description
This pull request introduces a new test suite for the layers in a mapview. The purpose of this test suite is to ensure the integrity and functionality of each layer within the mapview. This will hit queries and templates belong to a layer.

## 🛠️ Changes
- Added a new function `layerTest` that takes a `mapview` object as a parameter.
- Inside the `layerTest` function, a test suite is created using the `describe` function from the `codi` test library.
- The test suite iterates over each layer in the `mapview.layers` object using a `for...in` loop.
- For each layer, an individual test case is created using the `it` function.
- The test case checks if the layer's format is either 'maplibre' or 'tiles', or if the layer has an `infoj` property.
- If the condition is met, the test case proceeds to retrieve the last location associated with the layer by making an API call to `${mapp.host}/api/query` with the appropriate query parameters.
- The test case asserts that the retrieved last location has a defined `id` property using the `assertTrue` function.
- If the last location has an `id`, the test case retrieves the corresponding location using `mapp.location.get` with the layer and location ID.
- Finally, the retrieved location is removed using the `remove` method.

## ✨ Benefits
- Ensures the correctness and functionality of each layer in the mapview. ✅
- Helps identify any issues or inconsistencies related to layer formats, last locations, and location retrieval. 🐛
- Provides a structured way to test and maintain the layers in the mapview. 📊

## 🚀 Testing
- To run the test suite, you can simply hit the test view on localhost or any deployed instance.

Please let me know if you have any questions or if there are any additional changes required for this pull request. 😊