import * as fs from 'fs';
import { promisify } from 'util';
import { diff } from 'deep-object-diff';
import strings from '../strings.js';
import paths from '../paths.js';
import {
	IOError,
	JSONParseError,
} from '../errors.js';
import { LogUtility } from '../utilities.js';
import { IncorrectUsageError } from '../errors/incorrectUsage.error.js';

interface CredentialsItem {
	id: string;
	key: string;
}

export interface Credentials {
	ig: CredentialsItem;
	oxford: CredentialsItem;
}

export const CredentialsItem: Credentials = {
	ig: {
		id: '',
		key: '',
	},
	oxford: {
		id: '',
		key: '',
	},
};

export class CredentialsService extends LogUtility {
	public static async get(property: 'ig' | 'oxford'): Promise<CredentialsItem> {
		return (await this.getJSON())[property];
	}

	public static async getJSON(): Promise<Credentials> {
		const rawData = await this.getRaw();

		let result = { ...CredentialsItem };

		try {
			const jsonData = JSON.parse(rawData);

			result = { ...result, ...jsonData };
		} catch (err) {
			throw new JSONParseError({
				message: err.message,
			});
		}

		// if result is the same as 'CredentialsItem' (newly created)
		if (Object.keys(diff(result, CredentialsItem)).length === 0) {
			throw new IncorrectUsageError({
				message: strings.credentialsService.error.NO_CREDENTIALS,
			});
		}

		// if result has different structure (duck type) or contains empty strings
		if (Object.keys(diff(Object.keys(result), Object.keys(CredentialsItem))).length !== 0
			|| rawData.includes('""')) {
			this.warn(strings.credentialsService.warn.INCOMPLETE_CREDENTIALS);
		}

		return result;
	}

	public static async getRaw(): Promise<string> {
		await this.create();

		const result: string = await new Promise(
			(resolve) => fs.readFile(paths.internal.CREDENTIALS_FILE, 'utf8', (err, data) => {
				if (!err) {
					resolve(data);

					return;
				}

				throw new IOError({
					message: strings.credentialsService.error.READ_FAIL,
					fsError: err,
				});
			}),
		);

		this.log(strings.credentialsService.info.READ_SUCCESS);

		return result;
	}

	private static async create(): Promise<void> {
		if (await promisify(fs.exists)(paths.internal.CREDENTIALS_FILE)) {
			return;
		}

		await new Promise(
			(resolve) => fs.writeFile(
				paths.internal.CREDENTIALS_FILE,
				JSON.stringify(CredentialsItem, null, 4),
				(err) => {
					if (!err) {
						resolve();

						return;
					}

					throw new IOError({
						message: null,
						fsError: err,
					});
				},
			),
		);
	}
}
