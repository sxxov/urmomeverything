import * as fs from 'fs';
import strings from '../strings.js';
import paths from '../paths.js';
import { IOError } from '../errors.js';
import { LogUtility } from '../utilities.js';

export class HashtagsService extends LogUtility {
	public static async getRandom(length: number): Promise<string[]> {
		const arrayData = await this.getArray();

		for (let i = 0, l = arrayData.length - 1; i < l; ++i) {
			const j = Math.floor(Math.random() * (i + 1));

			[arrayData[i], arrayData[j]] = [arrayData[j], arrayData[i]];
		}

		return arrayData.slice(0, length);
	}

	public static async get(index: number): Promise<string> {
		return (await this.getArray())[index];
	}

	public static async getArray(): Promise<string[]> {
		return (await this.getRaw()).replace(/(\t|\n|\r)/g, '').split(',');
	}

	public static async getRaw(): Promise<string> {
		const result: string = await new Promise(
			(resolve) => fs.readFile(paths.internal.HASHTAGS_FILE, 'utf8', (err, data) => {
				if (!err) {
					resolve(data);

					return;
				}

				throw new IOError({
					message: strings.hashtagsService.error.READ_FAIL,
					fsError: err,
				});
			}),
		);

		this.log(strings.hashtagsService.info.READ_SUCCESS);

		return result;
	}
}
