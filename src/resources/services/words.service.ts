import * as fs from 'fs';
import strings from '../strings.js';
import paths from '../paths.js';
import { IOError } from '../errors.js';
import { LogUtility } from '../utilities.js';

export class WordsService extends LogUtility {
	public static async get(index: number): Promise<string> {
		return (await this.getArray())[index].trim();
	}

	public static async getArray(): Promise<string[]> {
		return (await this.getRaw()).split(',');
	}

	public static async getRaw(): Promise<string> {
		const result: string = await new Promise(
			(resolve) => fs.readFile(paths.internal.WORDS_FILE, 'utf8', (err, data) => {
				if (!err) {
					resolve(data);

					return;
				}

				throw new IOError({
					message: strings.wordsService.error.READ_FAIL,
					fsError: err,
				});
			}),
		);

		this.log(strings.wordsService.info.READ_SUCCESS);

		return result;
	}
}
