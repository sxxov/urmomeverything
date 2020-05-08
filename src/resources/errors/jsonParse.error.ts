import strings from '../strings.js';
import { ClientError } from './client.error.js';

export class JSONParseError extends ClientError {
	constructor(options: {
		message?: string;
	} = {}) {
		const { message } = options;

		super({
			message: `${strings.errors.JSON_PARSE}${message ? `: ${message}` : ''}`,
		});
	}
}
