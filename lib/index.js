'use strict';

const HauteCouture = require('@hapipal/haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        // Custom plugin code can go here
        setTimeout(()=>{
            server.app.services = {...server.app.services,...server.services()}
        },2000)
        await HauteCouture.compose(server, options);
    }
};
