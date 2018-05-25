const Waterline = require('waterline');
const waterline = new Waterline();

waterline.registerModel(
    Waterline.Collection.extend({
        identity: 'settings',
        primaryKey: '_id',
        datastore: 'mongo',
        attributes: {
            _id: { type: 'string' },
            title: { type: 'string' },
            select: { type: 'json' },
            locate: { type: 'json' },
            gazetteer: { type: 'json' },
            locale: { type: 'json' },
            locales: { type: 'json' }
        }
    })
);

// waterline.registerModel(
//     Waterline.Collection.extend({
//         identity: 'users',
//         primaryKey: '_id',
//         datastore: 'mongo',
//         attributes: {
//             _id: { type: 'string' },
//             email: { type: 'string' },
//             password: { type: 'string' },
//             verified: { type: 'boolean' },
//             approved: { type: 'boolean' },
//             admin: { type: 'boolean' },
//             verificationToken: { type: 'string' },
//             verificationTokenExpires: { type: 'number' }
//         }
//     })
// );

waterline.registerModel(
    Waterline.Collection.extend({
        identity: 'users',
        tableName: 'open_users',
        primaryKey: 'id',
        datastore: 'pg',
        attributes: {
            id: { type: 'string', autoMigrations: { autoIncrement: true } },
            email: { type: 'string' },
            password: { type: 'string' },
            verified: { type: 'boolean' },
            approved: { type: 'boolean' },
            admin: { type: 'boolean' },
            verificationToken: { type: 'string', columnName: 'verificationtoken' },
            verificationTokenExpires: { type: 'string', columnName: 'verificationtokenexpires' }
        }
    })
);

waterline.initialize({
    adapters: {
        'sails-mongo': require('sails-mongo'),
        'sails-postgresql': require('sails-postgresql')
    },
    datastores: {
        mongo: {
            adapter: 'sails-mongo',
            url: process.env.LOGIN
        },
        pg: {
            adapter: 'sails-postgresql',
            url: 'postgres://postgres:sabL6eHeD3aIrRg9GHJw@188.166.173.147:5432/xyz'
        }
    }
}, (err, orm) => {
    if (err) throw err;
    global.ORM = orm;
});