"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
const deep_object_diff_1 = require("deep-object-diff");
const strings_js_1 = require("../strings.js");
const paths_js_1 = require("../paths.js");
const errors_js_1 = require("../errors.js");
const utilities_js_1 = require("../utilities.js");
const incorrectUsage_error_js_1 = require("../errors/incorrectUsage.error.js");
exports.CredentialsItem = {
    ig: {
        id: '',
        key: '',
    },
    oxford: {
        id: '',
        key: '',
    },
};
class CredentialsService extends utilities_js_1.LogUtility {
    static get(property) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getJSON())[property];
        });
    }
    static getJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawData = yield this.getRaw();
            let result = Object.assign({}, exports.CredentialsItem);
            try {
                const jsonData = JSON.parse(rawData);
                result = Object.assign(Object.assign({}, result), jsonData);
            }
            catch (err) {
                throw new errors_js_1.JSONParseError({
                    message: err.message,
                });
            }
            // if result is the same as 'CredentialsItem' (newly created)
            if (Object.keys(deep_object_diff_1.diff(result, exports.CredentialsItem)).length === 0) {
                throw new incorrectUsage_error_js_1.IncorrectUsageError({
                    message: strings_js_1.default.credentialsService.error.NO_CREDENTIALS,
                });
            }
            // if result has different structure (duck type) or contains empty strings
            if (Object.keys(deep_object_diff_1.diff(Object.keys(result), Object.keys(exports.CredentialsItem))).length !== 0
                || rawData.includes('""')) {
                this.warn(strings_js_1.default.credentialsService.warn.INCOMPLETE_CREDENTIALS);
            }
            return result;
        });
    }
    static getRaw() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.create();
            const result = yield new Promise((resolve) => fs.readFile(paths_js_1.default.internal.CREDENTIALS_FILE, 'utf8', (err, data) => {
                if (!err) {
                    resolve(data);
                    return;
                }
                throw new errors_js_1.IOError({
                    message: strings_js_1.default.credentialsService.error.READ_FAIL,
                    fsError: err,
                });
            }));
            this.log(strings_js_1.default.credentialsService.info.READ_SUCCESS);
            return result;
        });
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield util_1.promisify(fs.exists)(paths_js_1.default.internal.CREDENTIALS_FILE)) {
                return;
            }
            yield new Promise((resolve) => fs.writeFile(paths_js_1.default.internal.CREDENTIALS_FILE, JSON.stringify(exports.CredentialsItem, null, 4), (err) => {
                if (!err) {
                    resolve();
                    return;
                }
                throw new errors_js_1.IOError({
                    message: null,
                    fsError: err,
                });
            }));
        });
    }
}
exports.CredentialsService = CredentialsService;
//# sourceMappingURL=credentials.service.js.map