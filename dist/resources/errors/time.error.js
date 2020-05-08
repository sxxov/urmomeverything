"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings_js_1 = require("../strings.js");
const client_error_js_1 = require("./client.error.js");
class TimeError extends client_error_js_1.ClientError {
    constructor(options) {
        const { currentTime, expectedTime, } = options;
        super({
            message: `${strings_js_1.default.errors.TIME}: ${currentTime} !== ${expectedTime}`,
        });
    }
}
exports.TimeError = TimeError;
//# sourceMappingURL=time.error.js.map