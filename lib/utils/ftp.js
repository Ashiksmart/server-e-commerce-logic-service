/* eslint-disable func-style */
/* eslint-disable @hapi/hapi/capitalize-modules */
/* eslint-disable @hapi/hapi/scope-start */
'use strict';

const ftp = require('basic-ftp');
const path = require('path');
const { Readable } = require('stream');

const { FTP_HOST, FTP_USERNAME, FTP_PASSWORD, FTP_FOLDER_PATH } = process.env;
const FTP_CONFIG = {
    host: FTP_HOST, // Replace with your FTP host
    user: FTP_USERNAME, // Replace with your FTP username
    password: FTP_PASSWORD, // Replace with your FTP password
    secure: false // Set true for FTPS
};

// 🔹 Function to Connect to FTP
async function connectFTP() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access(FTP_CONFIG);
        console.log('✅ Connected to FTP Server');
        return client;
    }
    catch (error) {
        console.error('❌ FTP Connection Error:', error);
        client.close();
        throw error;
    }
}

// 🔹 Function to Upload File Directly from Buffer
async function s3fileupload(model, file, token, type, file_path) {
    let client;
    try {
        client = await connectFTP();

        if (!file || !file._data || !file._data.data) {
            throw new Error('File is undefined or empty');
        }

        const sourceBuffer = Buffer.from(file._data.data);
        const filename = file.hapi.filename;
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${filename}`;
        const remotePath = `${FTP_FOLDER_PATH}/${token.account_id}/${model}/${uniqueFilename}`;
        const remoteFolder = path.dirname(remotePath);

        // 🔹 Ensure the directory exists
        await client.ensureDir(remoteFolder);
        console.log(`📂 Ensured directory exists: ${remoteFolder}`);

        if (type === 'create') {
            await client.uploadFrom(Readable.from(sourceBuffer), remotePath);
            console.log(`✅ File uploaded successfully: ${remotePath}`);
        }
        else if (type === 'update') {
            try {
                await client.remove(file_path);
                console.log(`⚠️ Existing file deleted: ${file_path}`);
            }
            catch (error) {
                console.log('⚠️ File not found or already deleted, proceeding with upload.');
            }

            await client.uploadFrom(Readable.from(sourceBuffer), remotePath);
            console.log(`✅ File updated: ${remotePath}`);
        }
        else if (type === 'delete') {
            try {
                await client.remove(file_path);
                console.log(`✅ File deleted: ${file_path}`);
            }
            catch (error) {
                console.log('⚠️ File not found for deletion.');
                return { statusCode: 204, message: 'no content' };
            }
        }

        return {
            statusCode: 200,
            message: 'success',
            data: {
                filename: uniqueFilename,
                content_type: file.hapi.headers['content-type'],
                file_path: remotePath,
                model
            }
        };
    }
    catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
    finally {
        if (client) {
            client.close();
        } // Ensure FTP connection is closed
    }
}


module.exports = {
    s3fileupload
};
