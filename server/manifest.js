'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const Schwifty = require('@hapipal/schwifty');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: 'NODE_ENV',
            $default: {
                log: ['error', 'start'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    jwtKey: {
                    $filter: 'NODE_ENV',
                    $default: {
                        $param: 'APP_SECRET',
                        $default: 'app-secret'
                    },
                    production: {           // In production do not default to "app-secret"
                        $param: 'APP_SECRET'
                    }
                }
            }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            },
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: {
                    info: {
                        title: 'Ecommerce Core API Documentation',
                        version: Pack.version,
                    },
                    securityDefinitions: {
                        'jwt': {
                            'type': 'apiKey',
                            'name': 'Authorization',
                            'in': 'header',
                            'x-keyPrefix': 'Bearer '
                        }
                    },
                    security: [{ jwt: [] }],
                    schemes: ['http', 'https'],
                    // basePath: '/api/v1',
                }
            },
            {
                plugin: '@hapipal/schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        knex: {
                            client: 'mysql',
                            connection: {
                                host: process.env.MYSQL_HOST,
                                user: process.env.MYSQL_USERNAME,
                                password: process.env.MYSQL_PASSWORD,
                                database: process.env.MYSQL_DATABASE
                            }
                        }
                    }
                }
            }
        ]
    }
});
