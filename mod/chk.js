function chkVals(vals, res) {
    vals.forEach((val) => {
        if (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0) {
            console.log('Possible SQL injection detected');
            res.status(406).sendFile(appRoot + '/public/dennis_nedry.gif');
        }
    })
    return res;
}

module.exports = {
    chkVals: chkVals
};