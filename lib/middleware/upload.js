const fs = require('fs');
const path = require('path');
const timestamp = new Date().getTime();
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
const s3fileupload = (model, file, token, type) => {
  try{
    if (type === "create") {

    } else if (type === "update") {

    } else if (type === "delete") {

    }
}
    catch (error) {
        console.log("error", error);
        throw error;
      }
};


module.exports = { uploadfile };