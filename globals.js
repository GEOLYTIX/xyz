module.exports = fastify => {
    global.dir = process.env.DIR || '';

    global.timeout = parseInt(process.env.TIMEOUT) || 30;

    global.failed_attempts = parseInt(process.env.FAILED_ATTEMPTS) || 3;

    global.KEYS = {};
    Object.keys(process.env).forEach(key => {
        if (key.split('_')[0] === 'KEY') {
            global.KEYS[key.split('_')[1]] = process.env[key];
        }
    });

    global.DBS = {};
    Object.keys(process.env).forEach(key => {
        if (key.split('_')[0] === 'DBS') {
            fastify.register(require('fastify-postgres'), {
                connectionString: process.env[key],
                name: key.split('_')[1]
            });
        }
    });
}