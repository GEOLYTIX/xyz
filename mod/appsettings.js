async function getAppSettings(req) {

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

    if (req.user) settings = await removeRestrictions(settings, req);

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

function removeRestrictions(settings, req) {
    (function objectEval(o, parent, key) {

        // check whether the object has restrictions.
        if (checkForRestrictions(o)) {
            // if the parent is an array splice the key index.
            if (parent.length > 0) return parent.splice(parseInt(key),1);

            // if the parent is an object delete the key from the parent.
            return delete parent[key];
        };

        // iterate through the object tree.
        Object.keys(o).forEach((key) => {
            if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key);
        })
    })(settings)

    function checkForRestrictions(o) {
        return Object.entries(o).some((e) => {
            // check whether an entry has 'restriction' as key and the value is not a member of the user object.
            return e[0] === 'restriction' && !req.user[e[1]]
        })
    };

    return settings;
}

function setAppSettingsValues(settings) {
    global.appSettings = settings;

    // Store all string keys in global array to check for SQL injections.
    global.appSettingsValues = [];
    (function objectEval(o) {
        Object.keys(o).forEach((key) => {
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