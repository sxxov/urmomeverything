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
const artist_js_1 = require("./core/artist.js");
const auditor_js_1 = require("./core/auditor.js");
const timekeeper_js_1 = require("./core/timekeeper.js");
const services_js_1 = require("./resources/services.js");
const utilities_js_1 = require("./resources/utilities.js");
class Main extends utilities_js_1.LogUtility {
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            utilities_js_1.LogUtility.addToContext(this);
            global.__logLevel = utilities_js_1.LogUtility.LOG_LEVEL.INFO;
            const handler = () => __awaiter(this, void 0, void 0, function* () {
                yield auditor_js_1.Auditor.continueOnInternet();
                const index = yield services_js_1.IndexService.get();
                const word = yield services_js_1.WordsService.get(index);
                const caption = yield services_js_1.CaptionService.get(word);
                const image = new artist_js_1.Artist().paint(word, index);
                Main.log(caption);
                fs.writeFileSync('./painted.jpg', image);
                const url = yield services_js_1.PublishService.photo(image, caption);
                const auditResult = yield auditor_js_1.Auditor.auditPublish(url);
                if (!auditResult) {
                    yield handler();
                    return;
                }
                yield services_js_1.IndexService.increment();
            });
            yield timekeeper_js_1.Timekeeper.scheduleEveryHour(handler);
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield new Main().create();
}))();
//# sourceMappingURL=main.js.map