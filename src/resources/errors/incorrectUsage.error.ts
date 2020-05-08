import strings from '../strings.js';
import { ClientError } from './client.error.js';

export class IncorrectUsageError extends ClientError {
	constructor(options: {
		message: string;
	}) {
		const { message } = options;

		super({
			message: `${strings.errors.INCORRECT_USAGE}${message ? `: ${message}` : ''}`,
		});
	}
}
