import * as XMLHttpRequest from 'xhr2';
import {
	JSONParseError,
} from '../errors.js';
import strings from '../strings';
import { CredentialsService } from '../services.js';
import { LogUtility } from '../utilities.js';
import { NetworkError } from '../errors/network.error.js';


export class DictionaryService extends LogUtility {
	private static get api(): {
		define: (word: string) => Promise<string>;
		} {
		return {
			async define(word: string): Promise<string> {
				const {
					id,
					key,
				} = await CredentialsService.get('oxford');

				const xhttp = new XMLHttpRequest();

				xhttp.open('GET', `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}?fields=definitions&strictMatch=false`, true);
				xhttp.setRequestHeader('Accept', 'application/json');
				xhttp.setRequestHeader('app_id', id);
				xhttp.setRequestHeader('app_key', key);
				xhttp.timeout = 10000;

				xhttp.send(null);

				await new Promise((resolve) => {
					xhttp.addEventListener('load', resolve);
					xhttp.addEventListener('timeout', (err: Error): void => {
						DictionaryService.error(err.message);

						resolve();
					});

					setTimeout(resolve, 12000);
				});

				const data = xhttp.response;
				let jsonData = null;

				switch (String(xhttp.status)[0]) {
				case '2': {
					try {
						jsonData = JSON.parse(data);

						if (Object.keys(jsonData).length === 0) {
							throw new Error();
						}
					} catch (err) {
						throw new JSONParseError();
					}

					const definition = jsonData
						.results[0]
									?.lexicalEntries[0]
									?.entries[0]
									?.senses[0]
									?.definitions[0]
									?? null;

					// returned data was malformed
					if (!String(definition)) {
						throw new NetworkError({
							message: `${strings.dictionaryService.error.DEFINE_FAIL}: ${word}`,
						});
					}

					DictionaryService.log(`${strings.dictionaryService.info.DEFINITION_FOUND}: ${word}: ${definition}`);
					DictionaryService.log(`${strings.dictionaryService.info.DEFINE_SUCCESS}: ${word}`);

					return definition;
				}
				case '4': {
					// 404 probably
					DictionaryService.log(`${strings.dictionaryService.info.DEFINITION_NOT_FOUND}: ${word}`);

					return null;
				}
				default: {
					// something actually went wrong
					throw new NetworkError({
						message: `${strings.dictionaryService.error.DEFINE_FAIL}: ${word}`,
					});
				}
				}
			},
		};
	}

	public static async define(word: string): Promise<string> {
		let definition = strings.dictionaryService.info.DEFINITION_PLACEHOLDER;
		let tolerance = 0;

		switch (true) {
		case word.slice(-1) === 's':
			tolerance = 1;
			break;
		case word.slice(-2) === 'ed':
			tolerance = 2;
			break;
		case word.slice(-3) === 'ies':
			tolerance = 3;
			break;
		default:
		}

		for (let i = 0; i <= tolerance; ++i) {
			const result = await this.api.define(word.substr(0, word.length - i));

			if (result) {
				definition = result;

				break;
			}
		}

		return definition;
	}
}
