export async function coreTest(mapview) {
    //API Tests
    await runAllTests(_mappTest.workspaceSuite);

    await runAllTests(_mappTest.templatesTest);
    _mappTest.queryTest();

    // const mapview = await _mappTest.base();
    // await runAllTests(_mappTest.userTest);
    // //Run Map Object test
    await runAllTests(_mappTest.mappTest);
    // // Run the dictionary Tests
    await runAllTests(_mappTest.dictionaryTest, mapview);
    // //Plugins Tests
    // await runAllTests(_mappTest.pluginsTest);
    // //Layer Tests
    await runAllTests(_mappTest.layer, mapview);
    // //Location Tests
    await runAllTests(_mappTest.locationTest, mapview);
    // //Mapview Tests
    await runAllTests(_mappTest.mapviewTest, mapview);
    // //UI Elements Tests
    await runAllTests(_mappTest.uiTest.elements, mapview);
    // //UI Layers Tests
    await runAllTests(_mappTest.uiTest.layers, mapview);
    await runAllTests(_mappTest.uiTest.layers.panels, mapview);
    // //UI tests
    // await runAllTests(_mappTest.uiTest, mapview);
    // //Format Tests
    await runAllTests(_mappTest.layer.formats, mapview);
    // //UI Locations Tests
    await runAllTests(_mappTest.uiTest.locations, mapview);
    // //Entries Tests
    await runAllTests(_mappTest.uiTest.locations.entries, mapview);
    // //Utils Tests
    await runAllTests(_mappTest.utilsTest, mapview);

}

/**
 * This function is used to execute all the test functions on the exported test object. 
 * @function runAllTests
 * @param {object} tests 
 * @param {object} mapview 
 */
async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests)
        .filter(item => typeof item === 'function');

    await Promise.all(testFunctions.map(testFn => testFn(mapview)));
}