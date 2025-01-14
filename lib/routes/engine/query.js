/* eslint-disable @hapi/hapi/scope-start */
"use strict";

const Helpers = require("../helpers");
const Joi = require("joi");
const Boom = require("@hapi/boom");
const Xss = require("xss");
const Constants = require("../../utils/constants");
const { validateAuth } = require("../../middleware/auth");
module.exports = Helpers.withDefaults({
  method: "POST",
  path: "/query",
  options: {
    validate: {
      payload: Joi.object().keys({
        application: Joi.string().required(),
        model: Joi.string().trim().required(),
        type: Joi.string()
          .trim()
          .required()
          .valid(Constants.OPERATION_TYPE.VIEW, Constants.OPERATION_TYPE.EDIT),
        filters: Joi.object().required(),
        fields: Joi.array().optional(),
        page: Joi.number().optional().allow(null),
        limit: Joi.number().optional().allow(null),
        sort: Joi.array().optional(),
        associated: Joi.array()
        .items({
          model: Joi.string()
            .required(),
          bindAs: Joi.object().keys({
            name: Joi.string()
              .required(),
            value: Joi.string()
              .required(),

          }),
          key: Joi.object().keys({
            primary: Joi.string()
              .required(),
            foreign: Joi.string()
              .required(),
               rules: Joi.object()
                .optional(),

          })       //main model column
            .required(),
          fields: Joi.array()        // sub model fields 
            .optional(),

        }).optional(),
      }),
    },
    tags: ["api"],
    handler: async (request, h) => {
      const authErrorHandler = validateAuth(request)
      if (!authErrorHandler.isValid) {
        return authErrorHandler.error
      }
      try {
        request.payload = JSON.parse(Xss(JSON.stringify(request.payload)));
      } catch (err) {
        const error = Boom.badRequest("Invalid Input");
        return error;
      }

      try {
        const { engine } = request.services();
        let output = await engine.query(
          request.payload.model,
          request.payload.filters,
          request.payload.fields,
          request.payload.page,
          request.payload.limit,
          request.payload.sort
        );
        if (request.payload.associated !== undefined && output.records.length > 0) {
          return engine.binding(output, request.payload.associated)
        } else {
          return output
        }
      } catch (error) {
        return Boom.badImplementation("Bad implementation");
      }
    },
  },
});
