// Check whether vals are found in the application settings.
function chkVals(vals, res) {
    vals.forEach((val) => {
        if (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0) {
            console.log('Possible SQL injection detected');
            // res.code(406).sendFile('/public/dennis_nedry.gif');
            return true;
        }
    })
}

// Check whether an ID contains spaces.
function chkID(id, res) {
    if (String(id).indexOf(' ') >= 0) return true;
}

module.exports = {
    chkVals: chkVals,
    chkID: chkID
};