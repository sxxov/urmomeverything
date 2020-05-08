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
const strings_js_1 = require("../strings.js");
const paths_js_1 = require("../paths.js");
const errors_js_1 = require("../errors.js");
const utilities_js_1 = require("../utilities.js");
class WordsService extends utilities_js_1.LogUtility {
    static get(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getArray())[index].trim();
        });
    }
    static getArray() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRaw()).split(',');
        });
    }
    static getRaw() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new Promise((resolve) => fs.readFile(paths_js_1.default.internal.WORDS_FILE, 'utf8', (err, data) => {
                if (!err) {
                    resolve(data);
                    return;
                }
                throw new errors_js_1.IOError({
                    message: strings_js_1.default.wordsService.error.READ_FAIL,
                    fsError: err,
                });
            }));
            this.log(strings_js_1.default.wordsService.info.READ_SUCCESS);
            return result;
        });
    }
}
exports.WordsService = WordsService;
//# sourceMappingURL=words.service.js.map