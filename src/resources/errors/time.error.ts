import strings from '../strings.js';
import { ClientError } from './client.error.js';

export class TimeError extends ClientError {
	constructor(options: {
		currentTime: string;
		expectedTime: string;
	}) {
		const {
			currentTime,
			expectedTime,
		} = options;

		super({
			message: `${strings.errors.TIME}: ${currentTime} !== ${expectedTime}`,
		});
	}
}
