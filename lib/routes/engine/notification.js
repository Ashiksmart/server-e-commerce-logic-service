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
  path: "/notification",
  options: {
    validate: {
      payload: Joi.object().keys({
        application: Joi.string().required(),
        model: Joi.string().trim().required(),
        payload: Joi.object().required().keys({
          id: Joi.string().required(),        //module id
          operation: Joi.string().required(),   // create,update,delete
          email: Joi.string().email().optional().allow(""), //user mail
          phone_number: Joi.string().optional().allow(""), // user phone
          user_id: Joi.string().optional().allow(""), //user id
          additional_info: Joi.object().optional(),
          account_id: Joi.string().optional().allow("")
        }),

      }),
    },
    tags: ["api"],
    handler: async (request, h) => {
      const authErrorHandler = validateAuth(request)
      // if (!authErrorHandler.isValid) {
      //   return authErrorHandler.error
      // }
      try {
        request.payload = JSON.parse(Xss(JSON.stringify(request.payload)));
      } catch (err) {
        const error = Boom.badRequest("Invalid Input");
        return error;
      }

      try {
        const authToken = request.headers?.authorization;
        let decode = {}
        if (authToken === undefined) {
          decode["account_id"] = request.payload.payload.account_id
        } else {
          decode = jwtDecode(authToken);
        }
        const { engine } = request.services();
        return engine.notification(
          request.payload.model,
          request.payload.payload, decode.account_id
        );
      } catch (error) {
        return Boom.badImplementation("Bad implementation");
      }
    },
  },
});
