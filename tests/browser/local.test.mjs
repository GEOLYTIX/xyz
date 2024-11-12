export async function coreTest() {
    const startTime = performance.now();

    // Essential setup that needs to run first and sequentially
    await _mappTest.workspaceTest();
    await _mappTest.queryTest();
    const mapview = await _mappTest.base();

    // Group tests that don't depend on mapview - these can run in parallel
    const independentTests = Promise.all([
        runAllTests(_mappTest.userTest),
        runAllTests(_mappTest.mappTest),
        runAllTests(_mappTest.pluginsTest),
        runAllTests(_mappTest.uiTest),
    ]);

    // Group tests that depend on mapview - these can run in parallel with each other
    const mapviewDependentTests = Promise.all([
        runAllTests(_mappTest.dictionaryTest, mapview),
        runAllTests(_mappTest.layerTest, mapview),
        runAllTests(_mappTest.locationTest, mapview),
        runAllTests(_mappTest.mapviewTest, mapview),
        runAllTests(_mappTest.ui_elementsTest, mapview),
        runAllTests(_mappTest.entriesTest, mapview),
        runAllTests(_mappTest.ui_layers, mapview),
        runAllTests(_mappTest.formatTest, mapview),
        runAllTests(_mappTest.ui_locations, mapview),
        runAllTests(_mappTest.utilsTest, mapview),
    ]);

    // Wait for all test groups to complete
    await Promise.all([independentTests, mapviewDependentTests]);

    const duration = performance.now() - startTime;
    console.log(`All tests completed in ${duration.toFixed(2)}ms`);
}

/**
 * Executes all test functions in parallel
 * @function runAllTests
 * @param {object} tests 
 * @param {object} mapview 
 */
async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests).filter(item => typeof item === 'function');
    return Promise.all(
        testFunctions.map(testFn =>
            Promise.resolve().then(() => testFn(mapview))
                .catch(error => {
                    console.error(`Error in test ${testFn.name}:`, error);
                    throw error;
                })
        )
    );
}