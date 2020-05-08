"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const utilities_js_1 = require("../utilities.js");
class ClientError extends utilities_js_1.LogUtility.mixClass(Error) {
    constructor(options) {
        const message = options.message || strings_js_1.default.errors.NO_MESSAGE_PROVIDED;
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        utilities_js_1.LogUtility.error(message, this);
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=client.error.js.map