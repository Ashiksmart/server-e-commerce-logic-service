'use strict';

const Glue = require('@hapi/glue');
const Exiting = require('exiting');
const Manifest = require('./manifest');
const Constants = require('./constants');

exports.deployment = async ({ start } = {}) => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });
    server.app.constant = Constants
    if (start) {
        await Exiting.createManager(server).start();
        process.env.NODE_ENV !== 'production'  && server.log(['start'], `Server started at ${server.info.uri}`);
        process.env.NODE_ENV === 'production'  && console.log(`Server started at ${server.info.uri}`);
        return server;
    }
    await server.initialize();

    return server;
};

if (require.main === module) {

    exports.deployment({ start: true });

    process.on('unhandledRejection', (err) => {
        console.log("error", err);
        throw err;
    });
}
