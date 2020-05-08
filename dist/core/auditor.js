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
const is_online_1 = require("is-online");
const XMLHttpRequest = require("xhr2");
const utilities_js_1 = require("../resources/utilities.js");
const strings_js_1 = require("../resources/strings.js");
const errors_js_1 = require("../resources/errors.js");
class Auditor extends utilities_js_1.LogUtility {
    static continueOnInternet() {
        return __awaiter(this, void 0, void 0, function* () {
            for (;;) {
                if (yield is_online_1.default({
                    timeout: 10000,
                })) {
                    return;
                }
                this.warn(strings_js_1.default.auditor.warn.NO_NETWORK);
            }
        });
    }
    static auditPublish(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`${strings_js_1.default.auditor.info.AUDIT_PUBLISH_START}: ${url}`);
            const xhttp = new XMLHttpRequest();
            xhttp.open('GET', url, true);
            xhttp.timeout = 10000;
            xhttp.send(null);
            yield new Promise((resolve) => {
                xhttp.addEventListener('load', resolve);
                xhttp.addEventListener('timeout', (err) => {
                    this.error(err.message);
                    resolve();
                });
                setTimeout(resolve, 12000);
            });
            if (String(xhttp.status)[0] === '2') {
                this.log(`${strings_js_1.default.auditor.info.AUDIT_PUBLISH_SUCCESS}: ${url}`);
                return true;
            }
            this.error(`${strings_js_1.default.auditor.error.AUDIT_PUBLISH_FAIL}: ${url}`);
            this.error(new errors_js_1.NetworkError({
                message: `${xhttp.status}: ${xhttp.statusText}`,
            }).message);
            return false;
        });
    }
}
exports.Auditor = Auditor;
//# sourceMappingURL=auditor.js.map