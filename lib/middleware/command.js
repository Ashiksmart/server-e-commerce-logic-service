'use strict';

const Boom = require('@hapi/boom');
const Constants = require('../utils/constants');

const errorHanding = (error) => {
    if (error?.nativeError?.sqlState === '23000') {
        return Boom.conflict();
    }
    else if (error?.sqlState) {
        return Boom.conflict(error.sqlMessage);
    }

    const err = Boom.badRequest(
        error.name ? `${error.name}:${error.type ?? error.message}` : error.message
    );
    return err;
};

const commandValidation = async (payload, schema) => {
    const validateObj = {};
    const response = payload.map((res, i) => {
        const { error, value } = schema.validate(res, {
            abortEarly: false
        });

        if (error) {
            error.details[0].path[0] = `payload.items[${i}].${error.details[0].path[0]}`;
            validateObj.error = error.details[0];
        }

        return value;
    });
    validateObj.response = response;

    return validateObj;
};

const commandProcessor = async (request, value, h) => {
    const commandPayload = request.payload;
    const { engine } = request.services();
    const result = await engine[commandPayload.type](
        commandPayload,
        commandPayload?.user?.email,
        value
    );
    if (result.statusCode == 201) {
        return h.response(result).code(201);
    }

    return result;
};

const jsonDtChanges = async (res) => {
    try {
        for (const fieldName of Object.keys(res)) {
            if (typeof res[fieldName] === 'object' && res[fieldName] !== null) {
                res[fieldName] = JSON.stringify(res[fieldName]);
            }
        }
        
    }
    catch (error) {
        console.log("error", error);
        
    }
};

const commandUpdate = async (items, userId, errorRecords, db, criteria) => {
    const res = items[0];
    await jsonDtChanges(res);
    res.updated_by = userId;
    res.updated_at = new Date();
    delete res.id
    try {

        const update = await db.where(criteria).update(res);
        if (update === 0) {
            const obj = { error: Constants.ERROR_MSG.INVALID_CRITERIA };
            errorRecords.push({ ...criteria, ...obj });
        }

    } catch (error) {
        if (error?.sqlMessage) {
            console.log(error)
            const obj = { error: error.sqlMessage };
            errorRecords.push({ ...criteria, ...obj });
        }
    }
};


module.exports = {
    errorHanding,
    commandValidation,
    commandProcessor,
    commandUpdate
};
