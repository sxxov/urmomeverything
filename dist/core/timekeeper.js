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
const schedule = require("node-schedule");
const services_1 = require("../resources/services");
const utilities_1 = require("../resources/utilities");
const strings_1 = require("../resources/strings");
const errors_js_1 = require("../resources/errors.js");
class Timekeeper extends utilities_1.LogUtility {
    static get current() {
        return {
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            second: new Date().getSeconds(),
        };
    }
    static get next() {
        return {
            hour: Timekeeper.current.hour === 23 ? 0 : Timekeeper.current.hour + 1,
            minute: Timekeeper.current.minute === 59 ? 0 : Timekeeper.current.minute + 1,
            second: Timekeeper.current.second === 59 ? 0 : Timekeeper.current.minute + 1,
        };
    }
    static wait(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
        });
    }
    static parseTime(hours, minutes, seconds) {
        const isPM = hours - 12 > 0;
        const processedHours = isPM ? hours - 12 : hours;
        const processedMinutes = minutes;
        const processedSeconds = seconds;
        return `${`0${processedHours}`.slice(0, 2)}:${`0${processedMinutes}`.slice(0, 2)}:${`0${processedSeconds}`.slice(0, 2)} ${isPM ? 'pm' : 'am'}`;
    }
    static millisecondsToMinutes(milliseconds) {
        return Math.floor(((milliseconds) / (60 * 1000)) % 60);
    }
    static millisecondsToSeconds(milliseconds) {
        return Math.floor((milliseconds % 60000) / 1000);
    }
    static scheduleEveryHour(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lastRun } = yield services_1.StateService.get('time');
            // if 'lastRun' is more than 1 hour from now
            // && it's less than XX:10 right now
            if (lastRun + 60 * 60 * 1000 < Date.now() && this.current.minute <= 10) {
                yield callback();
                yield postExecutionTask();
            }
            let millisecondsDelay = null;
            let hourToRun = null;
            endOfTickTask();
            schedule.scheduleJob('0 0 */1 * * *', () => __awaiter(this, void 0, void 0, function* () {
                yield this.wait(millisecondsDelay);
                if (!(this.current.hour === hourToRun
                    && this.current.minute <= this.millisecondsToMinutes(millisecondsDelay))) {
                    this.error(new errors_js_1.TimeError({
                        currentTime: this.parseTime(this.current.hour, this.current.minute, this.current.second),
                        expectedTime: this.parseTime(hourToRun, this.millisecondsToMinutes(millisecondsDelay), this.millisecondsToSeconds(millisecondsDelay)),
                    }).message);
                }
                else {
                    yield callback();
                    yield postExecutionTask();
                }
                endOfTickTask();
            }));
            function postExecutionTask() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield services_1.StateService.set('time', {
                        lastRun: Date.now(),
                    });
                });
            }
            function endOfTickTask() {
                // random with max of 10 minutes
                millisecondsDelay = Math.floor(Math.random() * 10 * 60 * 1000);
                hourToRun = Timekeeper.next.hour;
                Timekeeper.log(`${strings_1.default.timekeeper.info.SLEEPING}: ${Timekeeper.parseTime(hourToRun, Timekeeper.millisecondsToMinutes(millisecondsDelay), Timekeeper.millisecondsToSeconds(millisecondsDelay))}`);
            }
        });
    }
}
exports.Timekeeper = Timekeeper;
//# sourceMappingURL=timekeeper.js.map