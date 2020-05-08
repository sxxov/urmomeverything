import strings from '../strings.js';
import { ClientError } from './client.error.js';

export class IOError extends ClientError {
	constructor(options: {
		message: string;
		fsError?: NodeJS.ErrnoException;
	}) {
		const {
			message,
			fsError,
		} = options;

		super({
			message: `${strings.errors.IO}${message ? `: ${message}` : ''}\n${fsError?.message ?? ''}\n${fsError?.stack ?? ''}`,
		});
	}
}
