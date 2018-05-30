async function getAppSettings() {

    let settings = {};

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'mongodb') settings = await getSettingsFromDB();

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'postgres') settings = await getSettingsFromDB();

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'file') settings = await getSettingsFromFile();

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

async function saveAppSettings(req, res) {
    let existingSettings = await global.ORM.collections.settings.find();
    if (existingSettings.length === 0) {
        await global.ORM.collections.settings.create({
            settings: req.body.settings
        });
        req.session.hooks = {};
    } else {
        await global.ORM.collections.settings.update({})
            .set({
                settings: req.body.settings
            });
        req.session.hooks = {};
    }
    res.status(200).json({ ok: true });
}

async function getSettingsFromDB() {
    let settings = await global.ORM.collections.settings.find().limit(1);
    if (settings.length === 0) return {};
    return settings[0].settings;
}

async function getSettingsFromFile() {
    let fs = require('fs');
    return fs.existsSync('./settings/' + process.env.APPSETTINGS.split(':').pop()) ?
        JSON.parse(fs.readFileSync('./settings/' + process.env.APPSETTINGS.split(':').pop()), 'utf8') : {};
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
    getAppSettings: getAppSettings,
    saveAppSettings: saveAppSettings
};