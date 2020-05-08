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
const XMLHttpRequest = require("xhr2");
const errors_js_1 = require("../errors.js");
const strings_1 = require("../strings");
const services_js_1 = require("../services.js");
const utilities_js_1 = require("../utilities.js");
const network_error_js_1 = require("../errors/network.error.js");
class DictionaryService extends utilities_js_1.LogUtility {
    static get api() {
        return {
            define(word) {
                var _a, _b, _c, _d, _e;
                return __awaiter(this, void 0, void 0, function* () {
                    const { id, key, } = yield services_js_1.CredentialsService.get('oxford');
                    const xhttp = new XMLHttpRequest();
                    xhttp.open('GET', `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}?fields=definitions&strictMatch=false`, true);
                    xhttp.setRequestHeader('Accept', 'application/json');
                    xhttp.setRequestHeader('app_id', id);
                    xhttp.setRequestHeader('app_key', key);
                    xhttp.timeout = 10000;
                    xhttp.send(null);
                    yield new Promise((resolve) => {
                        xhttp.addEventListener('load', resolve);
                        xhttp.addEventListener('timeout', (err) => {
                            DictionaryService.error(err.message);
                            resolve();
                        });
                        setTimeout(resolve, 12000);
                    });
                    const data = xhttp.response;
                    let jsonData = null;
                    switch (String(xhttp.status)[0]) {
                        case '2': {
                            try {
                                jsonData = JSON.parse(data);
                                if (Object.keys(jsonData).length === 0) {
                                    throw new Error();
                                }
                            }
                            catch (err) {
                                throw new errors_js_1.JSONParseError();
                            }
                            const definition = (_e = (_d = (_c = (_b = (_a = jsonData
                                .results[0]) === null || _a === void 0 ? void 0 : _a.lexicalEntries[0]) === null || _b === void 0 ? void 0 : _b.entries[0]) === null || _c === void 0 ? void 0 : _c.senses[0]) === null || _d === void 0 ? void 0 : _d.definitions[0]) !== null && _e !== void 0 ? _e : null;
                            // returned data was malformed
                            if (!String(definition)) {
                                throw new network_error_js_1.NetworkError({
                                    message: `${strings_1.default.dictionaryService.error.DEFINE_FAIL}: ${word}`,
                                });
                            }
                            DictionaryService.log(`${strings_1.default.dictionaryService.info.DEFINITION_FOUND}: ${word}: ${definition}`);
                            DictionaryService.log(`${strings_1.default.dictionaryService.info.DEFINE_SUCCESS}: ${word}`);
                            return definition;
                        }
                        case '4': {
                            // 404 probably
                            DictionaryService.log(`${strings_1.default.dictionaryService.info.DEFINITION_NOT_FOUND}: ${word}`);
                            return null;
                        }
                        default: {
                            // something actually went wrong
                            throw new network_error_js_1.NetworkError({
                                message: `${strings_1.default.dictionaryService.error.DEFINE_FAIL}: ${word}`,
                            });
                        }
                    }
                });
            },
        };
    }
    static define(word) {
        return __awaiter(this, void 0, void 0, function* () {
            let definition = strings_1.default.dictionaryService.info.DEFINITION_PLACEHOLDER;
            let tolerance = 0;
            switch (true) {
                case word.slice(-1) === 's':
                    tolerance = 1;
                    break;
                case word.slice(-2) === 'ed':
                    tolerance = 2;
                    break;
                case word.slice(-3) === 'ies':
                    tolerance = 3;
                    break;
                default:
            }
            for (let i = 0; i <= tolerance; ++i) {
                const result = yield this.api.define(word.substr(0, word.length - i));
                if (result) {
                    definition = result;
                    break;
                }
            }
            return definition;
        });
    }
}
exports.DictionaryService = DictionaryService;
//# sourceMappingURL=dictionary.service.js.map