export async function coreTest() {
    //API Tests
    await runAllTests(_mappTest.workspaceSuite);

    await runAllTests(_mappTest.templatesTest);
    await _mappTest.queryTest();
    const mapview = await _mappTest.base();
    await runAllTests(_mappTest.userTest);
    //Run Map Object test
    await runAllTests(_mappTest.mappTest);
    // Run the dictionary Tests
    await runAllTests(_mappTest.dictionaryTest, mapview);
    //Plugins Tests
    await runAllTests(_mappTest.pluginsTest);
    //Layer Tests
    await runAllTests(_mappTest.layerTest, mapview);
    //Location Tests
    await runAllTests(_mappTest.locationTest, mapview);
    //Mapview Tests
    await runAllTests(_mappTest.mapviewTest, mapview);
    //UI Elements Tests
    await runAllTests(_mappTest.ui_elementsTest, mapview);
    //Entries Tests
    await runAllTests(_mappTest.entriesTest, mapview);
    //UI Layers Tests
    await runAllTests(_mappTest.ui_layers, mapview);
    //UI tests
    await runAllTests(_mappTest.uiTest, mapview);
    //Format Tests
    await runAllTests(_mappTest.formatTest, mapview);
    //UI Locations Tests
    await runAllTests(_mappTest.ui_locations, mapview);
    //Utils Tests
    await runAllTests(_mappTest.utilsTest, mapview);
}

/**
 * This function is used to execute all the test functions on the exported test object. 
 * @function runAllTests
 * @param {object} tests 
 * @param {object} mapview 
 */
async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests).filter(item => typeof item === 'function');

    for (const testFn of testFunctions) {
        try {
            await testFn(mapview);
        } catch (error) {
            console.error(`Error in test ${testFn.name}:`, error);
        }
    }
}