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
const strings_js_1 = require("../strings.js");
const utilities_js_1 = require("../utilities.js");
const services_js_1 = require("../services.js");
class IndexService extends utilities_js_1.LogUtility {
    static increment() {
        return __awaiter(this, void 0, void 0, function* () {
            const index = yield IndexService.get();
            const incrementedIndex = index + 1;
            this.log(`${strings_js_1.default.indexService.info.INCREMENT}: ${index} → ${incrementedIndex}`);
            return services_js_1.StateService.set(this.stateProperty, incrementedIndex);
        });
    }
    static get() {
        return __awaiter(this, void 0, void 0, function* () {
            return services_js_1.StateService.get(this.stateProperty);
        });
    }
}
exports.IndexService = IndexService;
IndexService.stateProperty = 'index';
//# sourceMappingURL=index.service.js.map