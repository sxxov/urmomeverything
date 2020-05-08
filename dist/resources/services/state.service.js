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
const strings_js_1 = require("../strings.js");
const paths_js_1 = require("../paths.js");
const errors_js_1 = require("../errors.js");
const utilities_js_1 = require("../utilities.js");
exports.StateItem = {
    ig: '',
    index: 0,
    time: {
        lastRun: 0,
    },
};
class StateService extends utilities_js_1.LogUtility {
    static get(property) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonData = yield this.getJSON();
            const value = jsonData[property];
            this.debug(`${strings_js_1.default.stateService.info.GET_PROPERTY_SUCCESS}: ${property} = ${value instanceof Object
                ? JSON.stringify(value)
                : value}`);
            return value;
        });
    }
    static set(property, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonData = yield this.getJSON();
            jsonData[property] = value;
            yield this.setJSON(jsonData);
            this.debug(`${strings_js_1.default.stateService.info.SET_PROPERTY_SUCCESS}: ${property} → ${value instanceof Object
                ? JSON.stringify(value)
                : value}`);
        });
    }
    static setJSON(value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedJSON = value;
            const rawData = JSON.stringify(value, null, 4);
            yield this.setRaw(rawData);
        });
    }
    static setRaw(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => fs.writeFile(paths_js_1.default.internal.STATE_FILE, value, (err) => {
                if (!err) {
                    resolve();
                    return;
                }
                throw new errors_js_1.IOError({
                    message: `${strings_js_1.default.stateService.error.WRITE_FAIL}: ${value}`,
                    fsError: err,
                });
            }));
            this.debug(`${strings_js_1.default.stateService.info.WRITE_SUCCESS} → ${value}`);
        });
    }
    static getJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedJSON) {
                return this.cachedJSON;
            }
            const rawData = yield this.getRaw();
            let result = Object.assign({}, exports.StateItem);
            try {
                result = Object.assign(Object.assign({}, result), JSON.parse(rawData));
            }
            catch (err) {
                throw new errors_js_1.JSONParseError({
                    message: err.message,
                });
            }
            this.cachedJSON = result;
            return result;
        });
    }
    static getRaw() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.create();
            const result = yield new Promise((resolve) => fs.readFile(paths_js_1.default.internal.STATE_FILE, 'utf8', (err, data) => {
                if (!err) {
                    resolve(data);
                    return;
                }
                throw new errors_js_1.IOError({
                    message: `${strings_js_1.default.stateService.info.READ_SUCCESS}: ${data}`,
                    fsError: err,
                });
            }));
            this.debug(`${strings_js_1.default.stateService.info.READ_SUCCESS} = ${result}`);
            return result;
        });
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield util_1.promisify(fs.exists)(paths_js_1.default.internal.STATE_FILE)) {
                return;
            }
            yield this.setJSON(exports.StateItem);
        });
    }
    static get cachedJSON() {
        return global.__cachedState;
    }
    static set cachedJSON(value) {
        global.__cachedState = value;
    }
}
exports.StateService = StateService;
//# sourceMappingURL=state.service.js.map