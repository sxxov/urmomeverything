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
const instagram_private_api_1 = require("instagram-private-api");
const inquirer_1 = require("inquirer");
const services_js_1 = require("../services.js");
const log_utility_js_1 = require("../utilities/log.utility.js");
const strings_js_1 = require("../strings.js");
const errors_js_1 = require("../errors.js");
const ig = new instagram_private_api_1.IgApiClient();
class PublishService extends log_utility_js_1.LogUtility {
    static photo(buffer, caption) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`${strings_js_1.default.publishService.info.PHOTO_START}: ${buffer.length}B`);
            yield this.loadState();
            let result = null;
            let url = null;
            try {
                result = yield ig.publish.photo({
                    file: buffer,
                    caption,
                });
                url = `https://www.instagram.com/p/${result.media.code}/`;
                this.log(`${strings_js_1.default.publishService.info.PHOTO_SUCCESS}: ${url}`);
            }
            catch (err) {
                if (err instanceof instagram_private_api_1.IgLoginRequiredError) {
                    yield this.login();
                    return this.photo(buffer, caption);
                }
                throw new errors_js_1.ErrorWrapper(err);
            }
            if (result.status !== 'ok') {
                throw new errors_js_1.PublishError({
                    message: `${strings_js_1.default.publishService.error.PHOTO_NOT_OK}: ${result.status}`,
                });
            }
            return url;
        });
    }
    static loadState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!services_js_1.StateService.get(this.stateProperty)) {
                return;
            }
            yield ig.state.deserialize(services_js_1.StateService.get(this.stateProperty));
        });
    }
    static subscribeToState() {
        ig.request.end$.subscribe(() => __awaiter(this, void 0, void 0, function* () {
            const { cookies, } = yield ig.state.serialize();
            yield services_js_1.StateService.set(this.stateProperty, cookies);
        }));
    }
    static login() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscribeToState();
            try {
                const { id, key, } = yield services_js_1.CredentialsService.get('ig');
                this.log(`${strings_js_1.default.publishService.info.LOGIN_START}: ${id}`);
                ig.state.generateDevice(id);
                yield ig.simulate.preLoginFlow();
                const profile = yield ig.account.login(id, key);
                process.nextTick(() => __awaiter(this, void 0, void 0, function* () { return ig.simulate.postLoginFlow(); }));
                this.log(`${strings_js_1.default.publishService.info.LOGIN_SUCCESS}: ${profile.username}`);
            }
            catch (err) {
                if (!(err instanceof instagram_private_api_1.IgCheckpointError)) {
                    throw new errors_js_1.ErrorWrapper(err);
                }
                this.warn(`${strings_js_1.default.publishService.warn.CHECKPOINT_START}: ${ig.state.checkpoint.message}`);
                yield ig.challenge.auto(true);
                this.warn(`${strings_js_1.default.publishService.warn.CHECKPOINT_START}: ${ig.state.checkpoint.message}`);
                const { code, } = yield inquirer_1.default.prompt([
                    {
                        type: 'input',
                        name: 'code',
                        message: strings_js_1.default.publishService.ask.CHECKPOINT_CODE,
                    },
                ]);
                try {
                    yield ig.challenge.sendSecurityCode(code);
                    this.log(`${strings_js_1.default.publishService.info.CHECKPOINT_SUCCESS}: ${ig.state.checkpoint.message}`);
                }
                catch (error) {
                    if (!(error instanceof instagram_private_api_1.IgChallengeWrongCodeError)) {
                        throw new errors_js_1.ErrorWrapper(error);
                    }
                    this.error(`${strings_js_1.default.publishService.error.CHECKPOINT_FAIL}: ${ig.state.checkpoint.message}`);
                }
                this.login();
            }
        });
    }
}
exports.PublishService = PublishService;
PublishService.stateProperty = 'ig';
//# sourceMappingURL=publish.service.js.map