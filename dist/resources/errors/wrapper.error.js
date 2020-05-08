"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const utilities_js_1 = require("../utilities.js");
class ErrorWrapper extends Error {
    constructor(error) {
        const message = error.message || strings_js_1.default.errors.NO_MESSAGE_PROVIDED;
        super(message);
        this.name = error.name;
        Error.captureStackTrace(this, this.constructor);
        utilities_js_1.LogUtility.error(message, this);
    }
}
exports.ErrorWrapper = ErrorWrapper;
//# sourceMappingURL=wrapper.error.js.map