import strings from '../strings.js';
import { LogUtility } from '../utilities.js';

export interface ErrorWrapper extends Error, LogUtility {}

export class ErrorWrapper extends Error {
	constructor(error: Error) {
		const message = error.message || strings.errors.NO_MESSAGE_PROVIDED;

		super(message);
		this.name = error.name;
		Error.captureStackTrace(this, this.constructor);

		LogUtility.error(message, this);
	}
}
