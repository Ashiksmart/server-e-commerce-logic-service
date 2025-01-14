'use strict';
const manifest = require('../../server/manifest');
const pluginData = manifest.get('/register/plugins', process.env)
const tokenData = pluginData.find(el => el.plugin === '../lib')?.options
module.exports = tokenData;
