"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const client_error_js_1 = require("./client.error.js");
class PublishError extends client_error_js_1.ClientError {
    constructor(options) {
        const { message } = options;
        super({
            message: `${strings_js_1.default.errors.PUBLISH}${message ? `: ${message}` : ''}`,
        });
    }
}
exports.PublishError = PublishError;
//# sourceMappingURL=publish.error.js.map