"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const client_error_js_1 = require("./client.error.js");
class NetworkError extends client_error_js_1.ClientError {
    constructor(options) {
        const { message } = options;
        super({
            message: `${strings_js_1.default.errors.NETWORK}${message ? `: ${message}` : ''}`,
        });
    }
}
exports.NetworkError = NetworkError;
//# sourceMappingURL=network.error.js.map