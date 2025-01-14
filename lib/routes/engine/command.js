'use strict';

const Helpers = require('../helpers');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const Xss = require('xss');
const Constants = require('../../utils/constants');
const { generateDynamicSchema } = require('../../utils/schema');
const { validateAuth } = require('../../middleware/auth');
const { commandValidation, commandProcessor } = require('../../middleware/command');
const { default: jwtDecode } = require('jwt-decode');

module.exports = Helpers.withDefaults({
    method: 'POST',
    path: '/command',
    options: {
        validate: {
            payload: Joi.object().keys({
                application: Joi.string().trim().required(),
                model: Joi.string().trim().required(),
                type: Joi.string()
                    .trim()
                    .required()
                    .valid(
                        Constants.OPERATION_TYPE.CREATE,
                        Constants.OPERATION_TYPE.UPDATE,
                        Constants.OPERATION_TYPE.DELETE
                    ),
                criteria: Joi.object().when('type', {
                    is: Constants.OPERATION_TYPE.DELETE,
                    then: Joi.object()
                        .keys({
                            id: Joi.array().items(Joi.number()).min(1).required()
                        })
                        .required(),
                    otherwise: Joi.object().optional()
                }),
                payload: Joi.object()
                    .when('type', {
                        not: Constants.OPERATION_TYPE.DELETE,
                        then: Joi.required(),
                        otherwise: Joi.forbidden()
                    })
                    .keys({
                        items: Joi.array().min(1).required()
                    })
            })
        },
        tags: ['api'],
        handler: async (request, h) => {
            const authErrorHandler = validateAuth(request);
            if (!authErrorHandler.isValid) {
                return authErrorHandler.error;
            }

            try {
                request.payload = JSON.parse(Xss(JSON.stringify(request.payload)));
            }
            catch (err) {
                const error = Boom.badRequest('Invalid Input');
                return error;
            }

            try {
                const response = [];
                const authToken = request.headers?.authorization;
                const decode = jwtDecode(authToken);
                request.payload.user = decode;
                if (request.payload.type === Constants.OPERATION_TYPE.CREATE) {
                    const schema = generateDynamicSchema(request.payload.model);
                    const payload = request.payload.payload.items;
                    const validate = await commandValidation(payload, schema);

                    if (validate?.error) {
                        return h.response(validate.error).code(400);
                    }

                    response.push(...validate.response);
                }

                return commandProcessor(request, response, h);
            }
            catch (error) {
                console.log("error :", error);
                return Boom.badImplementation('Bad implementation');
            }
        }
    }
});
