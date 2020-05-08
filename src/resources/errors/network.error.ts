import strings from '../strings.js';
import { ClientError } from './client.error.js';

export class NetworkError extends ClientError {
	constructor(options: {
		message: string;
	}) {
		const { message } = options;

		super({
			message: `${strings.errors.NETWORK}${message ? `: ${message}` : ''}`,
		});
	}
}
