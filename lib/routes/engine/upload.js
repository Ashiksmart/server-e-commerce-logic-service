/* eslint-disable @hapi/hapi/scope-start */
"use strict";

const Helpers = require("../helpers");
const Joi = require("joi");
const Boom = require("@hapi/boom");
const Xss = require("xss");
const Constants = require("../../utils/constants");
const { validateAuth } = require("../../middleware/auth");
const { default: jwtDecode } = require("jwt-decode");
module.exports = Helpers.withDefaults({
    method: "POST",
    path: "/upload",
    options: {
        validate: {
            payload: Joi.object().keys({
                application: Joi.string().required(),
                model: Joi.string().trim().required(),
                ids: Joi.any().when("type", {
                    not: Constants.OPERATION_TYPE.CREATE,
                    then: Joi.required(),
                    otherwise: Joi.forbidden(),
                }),
                external: Joi.boolean().optional().allow(""),  //is s3 or not
                file_path: Joi.any().when("type", {
                    not: Constants.OPERATION_TYPE.CREATE,
                    then: Joi.required(),
                    otherwise: Joi.forbidden(),
                }),

                type: Joi.string()
                    .trim()
                    .required()
                    .valid(
                        Constants.OPERATION_TYPE.CREATE,
                        Constants.OPERATION_TYPE.UPDATE,
                        Constants.OPERATION_TYPE.DELETE
                    ),
                file: Joi.any().when("type", {
                    not: Constants.OPERATION_TYPE.DELETE,
                    then: Joi.required(),
                    otherwise: Joi.forbidden(),
                })
                    .meta({ swaggerType: "file" })
                    .required()
                    .description('File upload')
            }).meta({ swaggerType: 'file' }),
        },

        payload: {
            output: "stream",
            allow: "multipart/form-data", // important
            parse: true,
            multipart: true,
            maxBytes: 5242880,
        },
        plugins: {
            "hapi-swagger": {
                payloadType: "form",
            },
        },
        tags: ["api"],
        handler: async (request, h) => {
            if (request.payload.file !== undefined && request.payload.file.length === undefined) {
                request.payload['file'] = [request.payload.file]
            }else if(request.payload.file === undefined){
                request.payload['file'] = []
            }
            if (request.payload.ids !== undefined && !Array.isArray(request.payload.ids)) {
                request.payload['ids'] = [request.payload.ids]
            }else if(request.payload.ids === undefined){
                request.payload['ids'] = []
            }
            if (request.payload.file_path !== undefined && !Array.isArray(request.payload.file_path)) {
                
                request.payload['file_path'] = [request.payload.file_path]
            }else if(request.payload.file_path === undefined){
                request.payload['file_path'] = []
            }
           


            const authErrorHandler = validateAuth(request)
            // if (!authErrorHandler.isValid) {
            //     return authErrorHandler.error
            // }
            try {
                request.payload = JSON.parse(Xss(JSON.stringify(request.payload)));
            } catch (err) {
                const error = Boom.badRequest("Invalid Input");
                return error;
            }

            try {
                const authToken = request.headers?.authorization;
                const decode = jwtDecode(authToken);
                const { engine } = request.services();
                return engine.upload(
                    request.payload.model,
                    request.payload.file, decode, request.payload.type, request.payload.external, request.payload.file_path, request.payload.ids

                );
            } catch (error) {
                return Boom.badImplementation("Bad implementation");
            }
        },
    },
});



