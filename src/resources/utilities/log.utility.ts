// eslint-disable-next-line max-classes-per-file
import * as fs from 'fs';
import inquirer from 'inquirer';
import { promisify } from 'util';
import Separator from 'inquirer/lib/objects/separator';
import paths from '../paths.js';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			__logLevel: number;
		}
	}
}

export class LogUtility {
	public static LOG_LEVEL = {
		DEBUG: 4,
		INFO: 3,
		WARN: 2,
		ERROR: 1,
		NONE: 0,
	}

	public static mixClass(ClassItem: {
		new(...args: any[]);
	}): typeof ProcessedClassItem {
		const ProcessedClassItem = class extends ClassItem {};

		ProcessedClassItem.prototype.debug = LogUtility.debug;
		ProcessedClassItem.prototype.log = LogUtility.log;
		ProcessedClassItem.prototype.warn = LogUtility.warn;
		ProcessedClassItem.prototype.error = LogUtility.error;
		ProcessedClassItem.prototype.ask = LogUtility.ask;

		return ProcessedClassItem;
	}

	public static addToContext(ctx: any): void {
		global.__logLevel = global.__logLevel ?? 2;

		ctx.debug = LogUtility.debug;
		ctx.log = LogUtility.log;
		ctx.warn = LogUtility.warn;
		ctx.error = LogUtility.error;
		ctx.ask = LogUtility.ask;
	}

	public static debug(message = '', ctx: any = this): void {
		LogUtility.__boiler({
			message,
			logLevel: this.LOG_LEVEL.DEBUG,
			printFunction: console.log,
			ctx,
		});
	}

	public static log(message = '', ctx: any = this): void {
		LogUtility.__boiler({
			message,
			logLevel: this.LOG_LEVEL.INFO,
			printFunction: console.log,
			ctx,
		});
	}

	public static error(message = '', ctx: any = this): void {
		LogUtility.__boiler({
			message,
			logLevel: this.LOG_LEVEL.ERROR,
			printFunction: console.error,
			ctx,
		});
	}

	public static warn(message = '', ctx: any = this): void {
		LogUtility.__boiler({
			message,
			logLevel: this.LOG_LEVEL.WARN,
			printFunction: console.warn,
			ctx,
		});
	}

	public static async ask(message = '', choices: Array<string | Separator> = ['OK']): Promise<string> {
		const processedChoices = choices;

		choices.forEach((choice, i) => {
			switch (choice) {
			case '':
				processedChoices[i] = new inquirer.Separator();
				break;
			default:
				processedChoices[i] = choice;
			}
		});

		const question = await inquirer.prompt([{
			type: 'list',
			name: 'answer',
			message,
			choices: processedChoices,
		}]);

		return question.answer;
	}

	private static async __boiler({
		message = '',
		logLevel = this.LOG_LEVEL.INFO,
		printFunction = console.log,
		ctx,
	}): Promise<void> {
		// eslint-disable-next-line no-nested-ternary
		const constructor = ctx && ctx.constructor !== LogUtility
			? (
				ctx.constructor.name !== 'Function'
					? ctx.constructor.name
					// eslint-disable-next-line new-cap
					: (new ctx()).constructor.name
			)
			: 'null';

		// get the log level name from 'logLevel' as value (eg. { ...VERBOSE: 4 } → 'VERBOSE')
		const [logLevelProperty] = Object.keys(this.LOG_LEVEL)
			.filter((key) => this.LOG_LEVEL[key] === logLevel);

		const currentTime = new Date().toLocaleString();

		const logMessage = `[${currentTime}] [${constructor}/${logLevelProperty}]: ${message}`;

		await LogUtility.appendLogFile(logMessage);

		if (logLevel > global.__logLevel) {
			return;
		}

		printFunction(logMessage);
	}

	private static async appendLogFile(message = ''): Promise<void> {
		return promisify(fs.appendFile)(paths.internal.LOG_FILE, `${message}\r\n`);
	}
}
