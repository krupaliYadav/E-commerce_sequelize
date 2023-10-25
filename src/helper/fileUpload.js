const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const { HTTP_STATUS_CODE } = require("../helper/constants.helper")

const fileUpload = async (file, allowedTypes, filePath) => {
    try {
        const { mimetype } = file;
        const img = mimetype.split("/");
        const extension = img[1].toLowerCase();

        if (!allowedTypes.includes(extension)) {
            return { status: HTTP_STATUS_CODE.BAD_REQUEST, success: false, message: `The ${extension} is not allowed..` }
        };

        const fileName = uuidv4() + "." + extension
        const newPath = path.resolve(__dirname, "../../" + `/public/${filePath}/${fileName}`);
        fs.copyFile(file.filepath, newPath, async (err) => {
            if (err) {
                return { status: HTTP_STATUS_CODE.BAD_REQUEST, success: false, message: err.message }
            }
        })
        return fileName
    } catch (error) {
        return { status: HTTP_STATUS_CODE.INTERNAL_SERVER, success: false, message: err.message }
    }

}

const deleteFile = async (filePath, fileName) => {
    try {
        const pathToFile = path.resolve(__dirname, "../../" + `/public/${filePath}/${fileName}`)
        if (fs.existsSync(pathToFile)) {
            fs.unlink(pathToFile, (err) => {
                if (err) {
                    console.log('Error deleting file:', err);
                } else {
                    console.log("delete file form public folder successfully");
                }
            })
        }
    } catch (error) {
        return { status: HTTP_STATUS_CODE.INTERNAL_SERVER, success: false, message: err.message }
    }
}

module.exports = {
    fileUpload,
    deleteFile
}