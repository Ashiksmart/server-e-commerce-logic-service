/* eslint-disable @hapi/hapi/scope-start */
/* eslint-disable @hapi/hapi/for-loop */
'use strict';

const Schmervice = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
// const database = require("../database");
const { errorHanding, commandUpdate } = require('../middleware/command');
const { filterQuery } = require('../middleware/query');
const { uploadfile } = require('../middleware/upload');
const { build_notification } = require('../notification_vendors/build_notification');

module.exports = class Engine extends Schmervice.Service {
    create(payload, userId, value, isUpload = false) {
        try {
            const { commonService } = this.server.services();
            const { mode , type } = this.server.app.constant;
            // const db = database(payload.model);
            // value.forEach((element) => {
            //   element.created_by = userId;
            //   element.updated_by = userId;
            // });
            const db = this.server.knex().from(payload.model);
            const response =  value.map(async (element) => {
                element.created_by = userId;
                element.updated_by = userId;
                return await db.insert(element);
            });

            return Promise.all(response)
                .then((insertedIdsArray) => {
                    const allInsertedIds = [].concat(...insertedIdsArray);
                    if (response) {

                        const activityPayload = {
                            account_id: payload.user.account_id,
                            model: payload.model,
                            model_id: allInsertedIds,
                            payload: payload.user,
                            mode: isUpload === true ? mode.UPLOAD_CREATE : mode.CREATE
                        };
                        commonService.centralLink(type.ACTIVITY,activityPayload);

                        const output = {
                            statusCode: 201,
                            message: 'success',
                            data: allInsertedIds
                        };
                        return output;

                    }

                    return Boom.badRequest();
                })
                .catch((error) => {
                    return errorHanding(error);
                });

        }
        catch (error) {
            return errorHanding(error);
        }
    }
    async update(payload, userId, isUpload) {
        try {
            const { commonService } = this.server.services();
            const { mode , type } = this.server.app.constant;
            // const db = database(payload.model);
            const db = this.server.knex().from(payload.model);
            const items = payload.payload.items;
            const errorRecords = [];
            const id = items[0].id;
            const fetchPaylod = {
                model: payload.model,
                model_id: id,
                field: JSON.parse(JSON.stringify(items[0]))
            };
            const fetch = await commonService.fetch(fetchPaylod);
            await commandUpdate(items, userId, errorRecords, db,payload.criteria);
            const itemsLength = items.length;

            const output = {
                message: 'success',
                totalCount: itemsLength,
                modifiedCount: itemsLength - errorRecords.length
            };
            if (errorRecords.length === 0) {

                const activityPayload = {
                    account_id: payload.user.account_id,
                    model: payload.model,
                    model_id: [id],
                    payload: payload.user,
                    oldobj: fetch,
                    newobj: fetchPaylod.field,
                    mode: isUpload === true ? mode.UPLOAD_UPDATE : mode.UPDATE
                };
                commonService.centralLink(type.ACTIVITY,activityPayload);

                output.statusCode = 200;
                return output;
            }

            output.statusCode = 204;
            output.errorRecords = errorRecords[0];

            return output;

        }
        catch (error) {
            return errorHanding(error);
        }
    }
    async delete(payload,isUpload) {
        try {
            const { commonService } = this.server.services();
            const { mode , type } = this.server.app.constant;
            // const db = database(payload.model);
            const db = this.server.knex().from(payload.model);
            const key = Object.keys(payload.criteria)[0];
            const deleteRec = await db.whereIn(key, payload.criteria[key]).del();
            if (deleteRec) {

                const activityPayload = {
                    account_id: payload.user.account_id,
                    model: payload.model,
                    model_id: payload.criteria[key],
                    payload: payload.user,
                    mode: isUpload === true ? mode.UPLOAD_DELETE : mode.DELETE
                };
                commonService.centralLink(type.ACTIVITY,activityPayload);

                const output = {
                    statusCode: 200,
                    message: 'success'
                };
                return output;
            }

            return Boom.badRequest();
        }
        catch (error) {
            return errorHanding(error);
        }
    }

    async query(model, _filters = {}, _fields = [].join(','), _page, _limit, _sort = []) {

        try {
            // const db = database(model);
            const db = this.server.knex().from(model);
            if (_page === undefined) {
                _page = 0;
            }

            if (_limit === undefined) {
                _limit = 10;
            }

            if (_limit !== null && _page !== null) {
                _page = _page ? (_page - 1) * _limit : _page;
            }
            else {
                _page = _page ? (_page - 1) * _limit : _page;
            }

            const fetchData = db.select(_fields);
            const validateFilter = { flag: true, error: '' };
            if (_filters) {
                for (const [key, value] of Object.entries(_filters)) {
                    filterQuery(_filters, key, value, fetchData, validateFilter);
                    if (!validateFilter.flag) {
                        break;
                    }

                }
            }

            if (validateFilter.flag) {
                if (_sort) {
                    fetchData.orderBy(_sort);
                }

                const totalRecords = await fetchData;
                let records;
                if (_limit !== null && _page !== null) {
                    records = await fetchData.limit(_limit).offset(_page);
                }
                else {
                    records = await fetchData;
                    _page = 0;
                    _limit = totalRecords.length;
                }

                const finalResult = {
                    cursor: {
                        currentPage: _page + 1,
                        perPage: _limit,
                        totalRecords: totalRecords.length
                    },
                    records,
                    associate_to: [],
                    bind_to: []
                };

                return finalResult;
            }

            return Boom.badRequest(`Invalid Input ${ JSON.stringify(validateFilter?.error ?? '' )}`);


        }
        catch (error) {
            return errorHanding(error);
        }
    }

    async getValueByPath(obj, path) {
        const keys = path.split('.');
        let result = [];
        const filteredArray = keys.filter((value, i) => i !== 0);
        const filteredArrayresult = filteredArray.join('.');
        try {
            const parsedObject = JSON.parse(obj[keys[0]]);
            if (typeof parsedObject === 'object' && parsedObject !== null && !Array.isArray(parsedObject)) {
                const ischeck_array = parsedObject[`${filteredArrayresult}`];
                if (Array.isArray(ischeck_array)) {
                    result = ischeck_array;
                }
                else {
                    result.push(ischeck_array);
                }

            }
            else if (Array.isArray(parsedObject)) {
                result = parsedObject;
            }
            else {
                result.push(parsedObject);
            }
        }
        catch (error) {
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                result.push(obj[keys[0]]);
            }
            else {
                console.error('An error occurred:', error.message);
            }
        }



        return await result;
    }
    async binding(records, condition) {

        try {

            const associate_arr = [];
            const binddata_arr = [];
            const queryOutput = records.records;
            for (let i = 0; i < queryOutput.length; i++) {
                const query_element = queryOutput[i];
                const related_arr = [];
                const bind_arr = [];
                for (let j = 0; j < condition.length; j++) {
                    const condition_element = condition[j];
                    const primary_key = condition_element.key.primary;
                    const foreign_key = condition_element.key.foreign;
                    const model = condition_element.model;


                    const foreign_key_arr = await this.getValueByPath(query_element, foreign_key);

                    for (let x = 0; x < foreign_key_arr.length; x++) {
                        let fields = [];
                        let filter = {};
                        const foreign_key_arr_element = foreign_key_arr[x];
                        filter[`${primary_key}`] = foreign_key_arr_element;
                        if (condition_element.key.hasOwnProperty('rules')) {
                            filter = { ...filter,...condition_element.key.rules };
                        }

                        if (condition_element.fields !== undefined && condition_element.fields.length > 0) {
                            fields = condition_element.fields;
                        }

                        const query_ = await this.query(model, filter, fields, 0, 10, []);
                        let related_data = {};
                        const asBind = {};
                        if (query_.records.length > 0) {
                            related_data = query_.records[0];
                            asBind[`${condition_element.bindAs.name}`] = related_data[`${condition_element.bindAs.value}`];
                        }

                        related_arr.push(related_data);
                        bind_arr.push(asBind);
                    }


                }

                associate_arr.push(related_arr);
                binddata_arr.push(bind_arr);
            }

            records.associate_to = associate_arr;
            records.bind_to = binddata_arr;
            return records;


        }
        catch (error) {
            console.log('error', error);

            return errorHanding(error);
        }
    }

    async upload(model, file = [], token, type, s3, file_path = [], ids = []) {
        try {
            const response = [];
            if (type === 'create') {
                for (let i = 0; i < file.length; i++) {
                    const result = await uploadfile(model, file[i], token, type, s3, file_path[i], i);
                    if (result.statusCode === 200) {

                        const userobj = { model: 'document', user: token };
                        const createdoc = await this.create(userobj, token.email, [{
                            id: ids.length > 0 ? ids[i] : '0',
                            file_name: result.data.filename,
                            file_path: result.data.file_path,
                            content_type: result.data.content_type,
                            model: result.data.model
                        }]);
                        result.data.docId = createdoc.data[0];
                        response.push(result.data);
                    }
                }
            }
            else {
                for (let j = 0; j < ids.length; j++) {

                    const result = uploadfile(model, file[j], token, type, s3, file_path[j], j);
                    if (result.statusCode === 200) {
                        if (type === 'update') {
                            const updatedoc = await this.update({
                                model: 'document', payload: {
                                    items: [{
                                        id: ids.length > 0 ? ids[j] : '0',
                                        file_name: result.data.filename,
                                        file_path: result.data.file_path,
                                        content_type: result.data.content_type,
                                        model: result.data.model
                                    }]
                                }
                            }, token.email);
                            result.data.docId = ids[j];
                        }
                        else {
                            const deletedoc = await this.delete({
                                model: 'document', criteria: [{
                                    id: ids.length > 0 ? ids[j] : '0'
                                    // file_path: result.data.file_path,

                                }]

                            });
                            result.data.docId = ids[j];
                        }

                        response.push(result.data);
                    }

                }
            }








            return response;
        }
        catch (error) {
            return errorHanding(error);
        }
    }

    async notification(model, payload, account_id) {
        try {
            const server = this.server;
            // async query(model, _filters = {}, _fields = [].join(","), _page = 0, _limit = 10, _sort = []) {
            let output;
            let count = 0;
            const module_id = await this.query('model', { name: model }, [], 0, 10, []);
            const get_notification = await this.query('notification', { model_id: module_id.records[0].id.toString(), account_id }, [], 0, 10, []);
            for (let i = 0; i < get_notification.records.length; i++) {
                const element = get_notification.records[i];
                const template_details = await this.query('notification_template', { id: element.template_id }, [], 0, 10, []);
                const vendor_details = await this.query('vendor', { id: template_details.records[0].vendor_id }, [], 0, 10, []);
                const template_content = await this.query('notification_template_content', { account_id, account_id, template_id: template_details.records[0].id }, [], 0, 10, []);
                const credits = await this.query('vendor_credential', { account_id,vendor_id: vendor_details.records[0].id }, [], 0, 10, []);

                const send_notification_data = build_notification(template_details.records[0], credits, element, payload, model, 'email', vendor_details.records[0].vendor_value, template_content.records[0],server);
                if (send_notification_data) {
                    count += 1;
                }


            }

            if (count > 0) {
                output = {
                    statusCode: 201,
                    message: 'success'
                };
            }
            else {
                output = {
                    statusCode: 204,
                    message: 'no data'
                };
            }

            return output;
        }
        catch (error) {
            console.log('error', error);
            return errorHanding(error);
        }
    }

};
