export async function coreTest(mapview) {
  //API Tests
  await runAllTests(_mappTest.mappTest);
  await runAllTests(_mappTest.dictionaryTest, mapview);
  await runAllTests(_mappTest.layer, mapview);
  await runAllTests(_mappTest.locationTest, mapview);
  await runAllTests(_mappTest.mapviewTest, mapview);
  await runAllTests(_mappTest.uiTest.elements, mapview);
  await runAllTests(_mappTest.uiTest.layers, mapview);
  await runAllTests(_mappTest.uiTest.layers.panels, mapview);
  await runAllTests(_mappTest.uiTest.layers.legends, mapview);
  await runAllTests(_mappTest.layer.formats, mapview);
  await runAllTests(_mappTest.uiTest.locations, mapview);
  await runAllTests(_mappTest.uiTest.locations.entries, mapview);
  await runAllTests(_mappTest.utilsTest, mapview);
}

/**
 * This function is used to execute all the test functions on the exported test object.
 * @function runAllTests
 * @param {object} tests
 * @param {object} mapview
 */
async function runAllTests(tests, mapview) {
  const testFunctions = Object.values(tests).filter(
    (item) => typeof item === 'function',
  );

  await Promise.all(testFunctions.map((testFn) => testFn(mapview)));
}
