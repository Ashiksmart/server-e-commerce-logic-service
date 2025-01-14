'use strict';

const _ = require('lodash');

const getANDBoolean = (...conditions) => conditions.every(Boolean);

const handleErrorFunction = (validateFilter, flag, error) => {

    validateFilter.flag = flag;
    validateFilter.error = error;
};

const filterQuery = (_filters, key, value, fetchData, validateFilter) => {

    try {
        const objectValue = _filters[key];
        const validateObjectValue = _.isEqual(value, {}) || _.isEqual(value, []) || [undefined, null].includes(value);
        if (typeof value !== 'object' || validateObjectValue) {
            value = validateObjectValue ? JSON.stringify(value) : value;
            fetchData.where(key, 'like', `%${value}%`);
        }
        else if (objectValue?.$gt !== undefined && objectValue?.$lt !== undefined) {
            fetchData.whereBetween(key, [objectValue?.$gt, objectValue?.$lt]);
        }
        else if (objectValue?.$gt !== undefined) {
            fetchData.where(key, '>', objectValue.$gt);
        }
        else if (objectValue?.$lt !== undefined) {
            fetchData.where(key, '<', objectValue.$lt);
        }
        else if (
            getANDBoolean(!!objectValue?.$in, Array.isArray(objectValue?.$in))
        ) {
            fetchData.whereIn(key, objectValue.$in);
        }
        else if (
            getANDBoolean(!!objectValue?.$nin, Array.isArray(objectValue?.$nin))
        ) {
            fetchData.whereNotIn(key, objectValue?.$nin);
        }
        else if (getANDBoolean(objectValue?.$eq !== undefined)) {
            fetchData.where(key, objectValue?.$eq);
        }
        else if (getANDBoolean(!!objectValue?.$ne)) {
            fetchData.whereNot(key, objectValue?.$ne);
        }
        else if (typeof objectValue === 'object') {
            for (let [prop, data] of Object.entries(objectValue)) {
                if (prop[0] === '$' && prop[1] === '.') {
                    const validatedNestedObjectValue =  _.isEqual(value, {}) || _.isEqual(value, []) || [undefined, null].includes(value);
                    if (validatedNestedObjectValue || typeof data !== 'object') {
                        data = validatedNestedObjectValue ? JSON.stringify(data) : data;
                        fetchData.whereRaw(`LOWER(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}'))) LIKE LOWER(?)`, `%${data}%`);
                    }
                    else if (typeof data === 'object') {
                        if (data.$eq !== undefined) {
                            fetchData.whereRaw(`JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) = ?`, data.$eq);
                        }
                        else if (data.$ne !== undefined) {
                            fetchData.whereRaw(`JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) <> ?`, data.$ne);
                        }
                        else if (data.$gt !== undefined && data.$lt !== undefined) {
                            fetchData.whereRaw(`CAST(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) AS SIGNED) BETWEEN ? AND ?`, [data.$gt, data.$lt]);
                        }
                        else if (data.$gt !== undefined) {
                            fetchData.whereRaw(`CAST(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) AS SIGNED) > ?`, data.$gt);
                        }
                        else if (data.$lt !== undefined) {
                            fetchData.whereRaw(`CAST(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) AS SIGNED) < ?`, data.$lt);
                        }
                        else if (getANDBoolean(!!data?.$in, Array.isArray(data?.$in))) {
                            const placeholders = Array(data?.$in.length).fill('?').join(', '); // Create placeholders
                            fetchData.whereRaw(`CAST(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) AS SIGNED) IN (${placeholders})`,  data?.$in);
                        }
                        else if (getANDBoolean(!!data?.$nin, Array.isArray(data?.$nin))) {
                            const placeholders = Array(data?.$nin.length).fill('?').join(', '); // Create placeholders
                            fetchData.whereRaw(`CAST(JSON_UNQUOTE(JSON_EXTRACT(${key}, '${prop}')) AS SIGNED) NOT IN (${placeholders})`, data?.$nin);
                        }

                        else {
                            handleErrorFunction(validateFilter, false, data);
                        }
                    }
                }
                else {
                    handleErrorFunction(validateFilter, false, objectValue);
                }
            }
        }
        else {
            handleErrorFunction(validateFilter, false, objectValue);
        }
    }
    catch (error) {
        handleErrorFunction(validateFilter, false, error);
        throw error;
    }
};

module.exports = { filterQuery };
