const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const timestamp = new Date().getTime();


const { FTP_HOST, FTP_USERNAME, FTP_PASSWORD } = process.env;
const FTP_CONFIG = {
    host: FTP_HOST,   // Replace with your FTP host
    user: FTP_USERNAME,     // Replace with your FTP username
    password: FTP_PASSWORD, // Replace with your FTP password
    secure: false              // Set true for FTPS
};

// Function to connect to FTP
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

let output={}
const uploadfile = (model, file, token, type, s3,file_path,index) => {
   try{
    if (s3 !== undefined) {
        s3fileupload(model, file, token, type,file_path,index)
    } else {
       return internalfileupload(model, file, token, type,file_path,index)
    }
}
    catch (error) {
        console.log("error", error);
        throw error;
      }
   
};
const internalfileupload = (model, file, token, type,file_path,index) => {
    try{
    let sourceBuffer
    let filename
    if(file!==undefined){
        sourceBuffer = Buffer.from(file._data.data);
        filename = file.hapi.filename;
    }
   
    const uniqueFilename = `${timestamp}_${filename}`;
    let destinationPath = `/var/www/html/FileManager/${token.account_id}/${model}/${uniqueFilename}`;
    const destinationFolder = path.dirname(destinationPath);

    if (type === "create") {
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true }); // Create the folder and any necessary parent directories.
        }
        fs.writeFileSync(destinationPath, sourceBuffer);
        output={
            statusCode: 200,
                message: "success",
                data:{
                    filename:uniqueFilename,
                    content_type:file.hapi.headers["content-type"],
                    file_path:destinationPath,
                    model:model
                }
            
        }
        return output
    } else if (type === "update") {
        let ExistPath = file_path;
       
        if (fs.existsSync(ExistPath)) {
            fs.unlinkSync(ExistPath);
            fs.writeFileSync(destinationPath, sourceBuffer);
            output={
                statusCode: 200,
                message: "success",
                data:{
                    filename:uniqueFilename,
                    content_type:file.hapi.headers["content-type"],
                    file_path:destinationPath,
                    model:model
                }
               
    
            }
            
        } else{
            output={
                statusCode: 204,
                message: "no content",
                
            }
            
        }
        return output
    } else if (type === "delete") {
        let destinationPath = file_path;
        if (fs.existsSync(destinationPath)) {
            fs.unlinkSync(destinationPath);
            output={
                statusCode: 200,
                message: "success",
                data:{
                    file_path:file_path,}
               
            }
           
        } else{
            output={
                statusCode: 204,
                message: "no content",
                
            }
            
        }
        return output
    }
}catch (error) {
    console.log("error", error);
    throw error;
  }
};

// Internal FTP file upload function
const s3fileupload = async (model, file, token, type, file_path) => {
    let client;
    try {
        client = await connectFTP();

        let sourceBuffer, filename;
        if (file !== undefined) {
            sourceBuffer = Buffer.from(file._data.data);
            filename = file.hapi.filename;
        } else {
            throw new Error("File is undefined");
        }

        const uniqueFilename = `${timestamp}_${filename}`;
        let remotePath = `/domains/plum-wasp-686705.hostingersite.com/public_html/FileManager/${token.account_id}/${model}/${uniqueFilename}`; // Relative path
        let remoteFolder = path.dirname(remotePath);

        // Ensure the directory exists before upload
        await client.ensureDir(remoteFolder);
        console.log(`📂 Ensured directory exists: ${remoteFolder}`);

        if (type === "create") {
            // Write temp file and upload
            const tempFilePath = path.join(__dirname, uniqueFilename);
            fs.writeFileSync(tempFilePath, sourceBuffer);
console.log("tempFilePath: ",tempFilePath);

            await client.uploadFrom(tempFilePath, remotePath);
            // fs.unlinkSync(tempFilePath); // Remove temp file after upload
            console.log(`✅ File uploaded successfully: ${remotePath}`);
            
            return {
                statusCode: 200,
                message: "success",
                data: {
                    filename: uniqueFilename,
                    content_type: file.hapi.headers["content-type"],
                    file_path: remotePath,
                    model
                }
            };
        } 
        else if (type === "update") {
            try {
                await client.remove(file_path);
                console.log(`⚠️ Existing file deleted: ${file_path}`);
            } catch (error) {
                console.log("⚠️ File not found or already deleted, proceeding with upload.");
            }
            
            // Write temp file and upload
            const tempFilePath = path.join(__dirname, uniqueFilename);
            fs.writeFileSync(tempFilePath, sourceBuffer);

            await client.uploadFrom(tempFilePath, remotePath);
            fs.unlinkSync(tempFilePath); // Remove temp file after upload
            console.log(`✅ File updated: ${remotePath}`);
            
            return {
                statusCode: 200,
                message: "success",
                data: {
                    filename: uniqueFilename,
                    content_type: file.hapi.headers["content-type"],
                    file_path: remotePath,
                    model
                }
            };
        } 
        else if (type === "delete") {
            try {
                await client.remove(file_path);
                console.log(`✅ File deleted: ${file_path}`);
                return {
                    statusCode: 200,
                    message: "success",
                    data: { file_path }
                };
            } catch (error) {
                console.log("⚠️ File not found for deletion.");
                return {
                    statusCode: 204,
                    message: "no content"
                };
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        if (client) client.close(); // Ensuring FTP connection is closed
    }
};


module.exports = { uploadfile };
