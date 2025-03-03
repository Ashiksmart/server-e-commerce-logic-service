/* eslint-disable @hapi/hapi/scope-start */
/* eslint-disable @hapi/hapi/capitalize-modules */
'use strict';

const fs = require('fs');
const path = require('path');
const ftp = require('../utils/ftp');

const timestamp = new Date().getTime();

let output = {};
const uploadfile = async (model, file, token, type, s3, file_path, index) => {
    try {
        if (s3 !== undefined) {
            return await ftp.s3fileupload(model, file, token, type, file_path, index)
        }

        return internalfileupload(model, file, token, type, file_path, index);

    }
    catch (error) {
        console.log('error', error);
        throw error;
    }
};

const internalfileupload = (model, file, token, type, file_path, index) => {
    try {
        let sourceBuffer;
        let filename;
        if (file !== undefined) {
            sourceBuffer = Buffer.from(file._data.data);
            filename = file.hapi.filename;
        }

        const uniqueFilename = `${timestamp}_${filename}`;
        const destinationPath = `/var/www/html/FileManager/${token.account_id}/${model}/${uniqueFilename}`;
        const destinationFolder = path.dirname(destinationPath);

        if (type === 'create') {
            if (!fs.existsSync(destinationFolder)) {
                fs.mkdirSync(destinationFolder, { recursive: true }); // Create the folder and any necessary parent directories.
            }

            fs.writeFileSync(destinationPath, sourceBuffer);
            output = {
                statusCode: 200,
                message: 'success',
                data: {
                    filename: uniqueFilename,
                    content_type: file.hapi.headers['content-type'],
                    file_path: destinationPath,
                    model
                }
            };
            return output;
        }
        else if (type === 'update') {
            const ExistPath = file_path;

            if (fs.existsSync(ExistPath)) {
                fs.unlinkSync(ExistPath);
                fs.writeFileSync(destinationPath, sourceBuffer);
                output = {
                    statusCode: 200,
                    message: 'success',
                    data: {
                        filename: uniqueFilename,
                        content_type: file.hapi.headers['content-type'],
                        file_path: destinationPath,
                        model
                    }
                };
            }
            else {
                output = {
                    statusCode: 204,
                    message: 'no content'
                };
            }

            return output;
        }
        else if (type === 'delete') {
            const destinationPath = file_path;
            if (fs.existsSync(destinationPath)) {
                fs.unlinkSync(destinationPath);
                output = {
                    statusCode: 200,
                    message: 'success',
                    data: {
                        file_path
                    }
                };
            }
            else {
                output = {
                    statusCode: 204,
                    message: 'no content'
                };
            }

            return output;
        }
    }
    catch (error) {
        console.log('error', error);
        throw error;
    }
};

module.exports = { uploadfile };
