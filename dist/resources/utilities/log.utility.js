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
// eslint-disable-next-line max-classes-per-file
const fs = require("fs");
const inquirer_1 = require("inquirer");
const util_1 = require("util");
const paths_js_1 = require("../paths.js");
class LogUtility {
    static mixClass(ClassItem) {
        const ProcessedClassItem = class extends ClassItem {
        };
        ProcessedClassItem.prototype.debug = LogUtility.debug;
        ProcessedClassItem.prototype.log = LogUtility.log;
        ProcessedClassItem.prototype.warn = LogUtility.warn;
        ProcessedClassItem.prototype.error = LogUtility.error;
        ProcessedClassItem.prototype.ask = LogUtility.ask;
        return ProcessedClassItem;
    }
    static addToContext(ctx) {
        var _a;
        global.__logLevel = (_a = global.__logLevel) !== null && _a !== void 0 ? _a : 2;
        ctx.debug = LogUtility.debug;
        ctx.log = LogUtility.log;
        ctx.warn = LogUtility.warn;
        ctx.error = LogUtility.error;
        ctx.ask = LogUtility.ask;
    }
    static debug(message = '', ctx = this) {
        LogUtility.__boiler({
            message,
            logLevel: this.LOG_LEVEL.DEBUG,
            printFunction: console.log,
            ctx,
        });
    }
    static log(message = '', ctx = this) {
        LogUtility.__boiler({
            message,
            logLevel: this.LOG_LEVEL.INFO,
            printFunction: console.log,
            ctx,
        });
    }
    static error(message = '', ctx = this) {
        LogUtility.__boiler({
            message,
            logLevel: this.LOG_LEVEL.ERROR,
            printFunction: console.error,
            ctx,
        });
    }
    static warn(message = '', ctx = this) {
        LogUtility.__boiler({
            message,
            logLevel: this.LOG_LEVEL.WARN,
            printFunction: console.warn,
            ctx,
        });
    }
    static ask(message = '', choices = ['OK']) {
        return __awaiter(this, void 0, void 0, function* () {
            const processedChoices = choices;
            choices.forEach((choice, i) => {
                switch (choice) {
                    case '':
                        processedChoices[i] = new inquirer_1.default.Separator();
                        break;
                    default:
                        processedChoices[i] = choice;
                }
            });
            const question = yield inquirer_1.default.prompt([{
                    type: 'list',
                    name: 'answer',
                    message,
                    choices: processedChoices,
                }]);
            return question.answer;
        });
    }
    static __boiler({ message = '', logLevel = this.LOG_LEVEL.INFO, printFunction = console.log, ctx, }) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-nested-ternary
            const constructor = ctx && ctx.constructor !== LogUtility
                ? (ctx.constructor.name !== 'Function'
                    ? ctx.constructor.name
                    // eslint-disable-next-line new-cap
                    : (new ctx()).constructor.name)
                : 'null';
            // get the log level name from 'logLevel' as value (eg. { ...VERBOSE: 4 } → 'VERBOSE')
            const [logLevelProperty] = Object.keys(this.LOG_LEVEL)
                .filter((key) => this.LOG_LEVEL[key] === logLevel);
            const currentTime = new Date().toLocaleString();
            const logMessage = `[${currentTime}] [${constructor}/${logLevelProperty}]: ${message}`;
            yield LogUtility.appendLogFile(logMessage);
            if (logLevel > global.__logLevel) {
                return;
            }
            printFunction(logMessage);
        });
    }
    static appendLogFile(message = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(fs.appendFile)(paths_js_1.default.internal.LOG_FILE, `${message}\r\n`);
        });
    }
}
exports.LogUtility = LogUtility;
LogUtility.LOG_LEVEL = {
    DEBUG: 4,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    NONE: 0,
};
//# sourceMappingURL=log.utility.js.map