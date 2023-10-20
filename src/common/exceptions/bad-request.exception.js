const GeneralError = require("./general-error")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")

class BadRequestException extends GeneralError {
    constructor(message = "Bad Request!") {
        super();
        this.message = message;
        this.statusCode = HTTP_STATUS_CODE.BAD_REQUEST;
    }
}

module.exports = BadRequestException;