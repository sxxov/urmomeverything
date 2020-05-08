import * as fs from 'fs';
import { promisify } from 'util';
import strings from '../strings.js';
import paths from '../paths.js';
import {
	IOError,
	JSONParseError,
} from '../errors.js';
import { LogUtility } from '../utilities.js';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			__cachedState: StateItem;
		}
	}
}

export interface StateItem {
	ig?: string;
	index?: number;
	time?: {
		lastRun?: number;
	};
}

export const StateItem: StateItem = {
	ig: '',
	index: 0,
	time: {
		lastRun: 0,
	},
};

export class StateService extends LogUtility {
	public static async get<T>(property: string): Promise<T> {
		const jsonData = await this.getJSON();
		const value = jsonData[property];

		this.debug(`${strings.stateService.info.GET_PROPERTY_SUCCESS}: ${property} = ${
			value instanceof Object
				? JSON.stringify(value)
				: value
		}`);

		return value;
	}

	public static async set<T>(property: string, value: T): Promise<void> {
		const jsonData = await this.getJSON();

		jsonData[property] = value;

		await this.setJSON(jsonData);

		this.debug(`${strings.stateService.info.SET_PROPERTY_SUCCESS}: ${property} → ${
			value instanceof Object
				? JSON.stringify(value)
				: value
		}`);
	}

	public static async setJSON(value: StateItem): Promise<void> {
		this.cachedJSON = value;

		const rawData = JSON.stringify(value, null, 4);

		await this.setRaw(rawData);
	}

	private static async setRaw(value: string): Promise<void> {
		await new Promise(
			(resolve) => fs.writeFile(paths.internal.STATE_FILE, value, (err) => {
				if (!err) {
					resolve();

					return;
				}

				throw new IOError({
					message: `${strings.stateService.error.WRITE_FAIL}: ${value}`,
					fsError: err,
				});
			}),
		);

		this.debug(`${strings.stateService.info.WRITE_SUCCESS} → ${value}`);
	}

	public static async getJSON(): Promise<StateItem> {
		if (this.cachedJSON) {
			return this.cachedJSON;
		}

		const rawData = await this.getRaw();

		let result = { ...StateItem };

		try {
			result = { ...result, ...JSON.parse(rawData) };
		} catch (err) {
			throw new JSONParseError({
				message: err.message,
			});
		}

		this.cachedJSON = result;

		return result;
	}

	private static async getRaw(): Promise<string> {
		await this.create();

		const result: string = await new Promise(
			(resolve) => fs.readFile(paths.internal.STATE_FILE, 'utf8', (err, data) => {
				if (!err) {
					resolve(data);

					return;
				}

				throw new IOError({
					message: `${strings.stateService.info.READ_SUCCESS}: ${data}`,
					fsError: err,
				});
			}),
		);

		this.debug(`${strings.stateService.info.READ_SUCCESS} = ${result}`);

		return result;
	}

	private static async create(): Promise<void> {
		if (await promisify(fs.exists)(paths.internal.STATE_FILE)) {
			return;
		}

		await this.setJSON(StateItem);
	}

	private static get cachedJSON(): StateItem {
		return global.__cachedState;
	}

	private static set cachedJSON(value: StateItem) {
		global.__cachedState = value;
	}
}
