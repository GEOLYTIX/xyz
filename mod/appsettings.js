async function getAppSettings() {

    let settings = {};

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.substr(0, 5) === 'mongo') settings = await getSettingsFromMongo();

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.substr(-5) === '.json') settings = await getSettingsFromFile();

    if (Object.keys(settings).length === 0) settings = {
        "locales": {
            "Global": {
                "layers": {
                    "base": {
                        "display": true,
                        "format": "tiles",
                        "URI": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                }
            }
        }
    };

    await setAppSettingsValues(settings);
}

async function getSettingsFromMongo() {
    let settings  = await global.ORM.collections.settings.find().limit(1);
    return settings[0];
}

async function getSettingsFromFile() {
    let fs = require('fs');
    return fs.existsSync('./settings/' + process.env.APPSETTINGS) ?
        JSON.parse(fs.readFileSync('./settings/' + process.env.APPSETTINGS), 'utf8') : {};


    
}

function setAppSettingsValues(settings) {
    global.appSettings = settings;

    // Store all string keys in global array to check for SQL injections.
    global.appSettingsValues = [];
    (function objectEval(o) {
        Object.keys(o).map(function (key) {
            if (typeof key === 'string') global.appSettingsValues.push(key);
            if (typeof o[key] === 'string') global.appSettingsValues.push(o[key]);
            if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
        })
    })(global.appSettings)

    // Push defaults into appSettingsValues
    Array.prototype.push.apply(global.appSettingsValues, ['geom', 'id']);
}

module.exports = {
    getAppSettings: getAppSettings
};