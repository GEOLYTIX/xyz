const Waterline = require('waterline');

const waterline = new Waterline();
const datastores = {}

if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'postgres') {
    datastores.pg_settings = {
        adapter: 'sails-postgresql',
        url: process.env.APPSETTINGS.split('|')[0]
    };
    waterline.registerModel(
        Waterline.Collection.extend({
            identity: 'settings',
            primaryKey: '_id',
            tableName: process.env.APPSETTINGS.split('|').pop(),
            datastore: 'pg_settings',
            attributes: {
                _id: { type: 'string', autoMigrations: { autoIncrement: true } },
                settings: { type: 'json' }
            }
        })
    );
}

if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'mongodb') {
    datastores.mongo_settings = {
        adapter: 'sails-mongo',
        url: process.env.APPSETTINGS
    };
    waterline.registerModel(
        Waterline.Collection.extend({
            identity: 'settings',
            primaryKey: '_id',
            datastore: 'mongo_settings',
            attributes: {
                _id: { type: 'string' },
                settings: { type: 'json' }
            }
        })
    );
}

if (process.env.LOGIN && process.env.LOGIN.split(':')[0] === 'postgres') {
    datastores.pg_users = {
        adapter: 'sails-postgresql',
        url: process.env.LOGIN.split('|')[0]
    };
    waterline.registerModel(
        Waterline.Collection.extend({
            identity: 'users',
            tableName: process.env.LOGIN.split('|').pop(),
            primaryKey: '_id',
            datastore: 'pg_users',
            attributes: {
                _id: { type: 'string', autoMigrations: { autoIncrement: true } },
                email: { type: 'string' },
                password: { type: 'string' },
                verified: { type: 'boolean' },
                approved: { type: 'boolean' },
                admin: { type: 'boolean' },
                verificationToken: { type: 'string', columnName: 'verificationtoken' }
            }
        })
    );
}

if (process.env.LOGIN && process.env.LOGIN.split(':')[0] === 'mongo') {
    datastores.mongo_users = {
        adapter: 'sails-mongo',
        url: process.env.LOGIN
    };
    waterline.registerModel(
        Waterline.Collection.extend({
            identity: 'users',
            primaryKey: '_id',
            datastore: 'mongo_users',
            attributes: {
                _id: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                verified: { type: 'boolean' },
                approved: { type: 'boolean' },
                admin: { type: 'boolean' },
                verificationToken: { type: 'string' }
            }
        })
    );
}

waterline.initialize({
    adapters: {
        'sails-mongo': require('sails-mongo'),
        'sails-postgresql': require('sails-postgresql')
    },
    datastores: datastores
}, (err, orm) => {
    if (err) console.error(err);
    global.ORM = orm;
});