/* eslint-disable @hapi/hapi/scope-start */
'use strict';

const Helpers = require('../helpers');
const Boom = require('@hapi/boom');

module.exports = Helpers.withDefaults({
    method: 'GET',
    path: '/health-check',
    options: {
        tags: ['api'],
        handler: () => {
            try {
                return {
                    statusCode: 200,
                    message: 'success'
                };
            }
            catch (error) {
                console.log(error);
                const Error = Boom.badImplementation('Bad implementation');
                return Error;
            }
        }
    }
});
