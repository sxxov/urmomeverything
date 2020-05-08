"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const client_error_js_1 = require("./client.error.js");
class IOError extends client_error_js_1.ClientError {
    constructor(options) {
        var _a, _b;
        const { message, fsError, } = options;
        super({
            message: `${strings_js_1.default.errors.IO}${message ? `: ${message}` : ''}\n${(_a = fsError === null || fsError === void 0 ? void 0 : fsError.message) !== null && _a !== void 0 ? _a : ''}\n${(_b = fsError === null || fsError === void 0 ? void 0 : fsError.stack) !== null && _b !== void 0 ? _b : ''}`,
        });
    }
}
exports.IOError = IOError;
//# sourceMappingURL=io.error.js.map