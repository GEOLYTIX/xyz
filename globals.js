module.exports = fastify => {

    // Set globals for API keys, Database connections, etc.
    global.dir = process.env.DIR || '';

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