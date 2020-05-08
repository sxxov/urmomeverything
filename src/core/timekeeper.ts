import * as schedule from 'node-schedule';
import { StateService, StateItem } from '../resources/services';
import { LogUtility } from '../resources/utilities';
import strings from '../resources/strings';
import { TimeError } from '../resources/errors.js';

export class Timekeeper extends LogUtility {
	public static get current(): {
		hour: number;
		minute: number;
		second: number;
		} {
		return {
			hour: new Date().getHours(),
			minute: new Date().getMinutes(),
			second: new Date().getSeconds(),
		};
	}

	public static get next(): {
		hour: number;
		minute: number;
		second: number;
		} {
		return {
			hour: Timekeeper.current.hour === 23 ? 0 : Timekeeper.current.hour + 1,
			minute: Timekeeper.current.minute === 59 ? 0 : Timekeeper.current.minute + 1,
			second: Timekeeper.current.second === 59 ? 0 : Timekeeper.current.minute + 1,
		};
	}

	public static async wait(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	public static parseTime(hours: number, minutes: number, seconds: number): string {
		const isPM = hours - 12 > 0;
		const processedHours = isPM ? hours - 12 : hours;
		const processedMinutes = minutes;
		const processedSeconds = seconds;

		return `${`0${processedHours}`.slice(0, 2)}:${`0${processedMinutes}`.slice(0, 2)}:${`0${processedSeconds}`.slice(0, 2)} ${isPM ? 'pm' : 'am'}`;
	}

	public static millisecondsToMinutes(milliseconds: number): number {
		return Math.floor(((milliseconds) / (60 * 1000)) % 60);
	}

	public static millisecondsToSeconds(milliseconds: number): number {
		return Math.floor((milliseconds % 60000) / 1000);
	}

	public static async scheduleEveryHour(callback: () => Promise<void>): Promise<void> {
		const { lastRun } = await StateService.get<typeof StateItem.time>('time');

		// if 'lastRun' is more than 1 hour from now
		// && it's less than XX:10 right now
		if (lastRun + 60 * 60 * 1000 < Date.now() && this.current.minute <= 10) {
			await callback();
			await postExecutionTask();
		}

		let millisecondsDelay = null;
		let hourToRun = null;

		endOfTickTask();

		schedule.scheduleJob(
			'0 0 */1 * * *',
			async () => {
				await this.wait(millisecondsDelay);

				if (!(this.current.hour === hourToRun
				&& this.current.minute <= this.millisecondsToMinutes(millisecondsDelay))) {
					this.error(new TimeError({
						currentTime: this.parseTime(
							this.current.hour,
							this.current.minute,
							this.current.second,
						),
						expectedTime: this.parseTime(
							hourToRun,
							this.millisecondsToMinutes(millisecondsDelay),
							this.millisecondsToSeconds(millisecondsDelay),
						),
					}).message);
				} else {
					await callback();
					await postExecutionTask();
				}

				endOfTickTask();
			},
		);

		async function postExecutionTask(): Promise<void> {
			await StateService.set<typeof StateItem.time>('time', {
				lastRun: Date.now(),
			});
		}

		function endOfTickTask(): void {
			// random with max of 10 minutes
			millisecondsDelay = Math.floor(Math.random() * 10 * 60 * 1000);
			hourToRun = Timekeeper.next.hour;

			Timekeeper.log(`${strings.timekeeper.info.SLEEPING}: ${Timekeeper.parseTime(
				hourToRun,
				Timekeeper.millisecondsToMinutes(millisecondsDelay),
				Timekeeper.millisecondsToSeconds(millisecondsDelay),
			)}`);
		}
	}
}
