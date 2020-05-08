import isOnline from 'is-online';
import * as XMLHttpRequest from 'xhr2';
import { LogUtility } from '../resources/utilities.js';
import strings from '../resources/strings.js';
import { NetworkError } from '../resources/errors.js';

export class Auditor extends LogUtility {
	public static async continueOnInternet(): Promise<void> {
		for (;;) {
			if (await isOnline({
				timeout: 10000,
			})) {
				return;
			}

			this.warn(strings.auditor.warn.NO_NETWORK);
		}
	}

	public static async auditPublish(url: string): Promise<boolean> {
		this.log(`${strings.auditor.info.AUDIT_PUBLISH_START}: ${url}`);

		const xhttp = new XMLHttpRequest();

		xhttp.open('GET', url, true);
		xhttp.timeout = 10000;

		xhttp.send(null);

		await new Promise((resolve) => {
			xhttp.addEventListener('load', resolve);
			xhttp.addEventListener('timeout', (err: Error): void => {
				this.error(err.message);

				resolve();
			});

			setTimeout(resolve, 12000);
		});

		if (String(xhttp.status)[0] === '2') {
			this.log(`${strings.auditor.info.AUDIT_PUBLISH_SUCCESS}: ${url}`);

			return true;
		}

		this.error(`${strings.auditor.error.AUDIT_PUBLISH_FAIL}: ${url}`);
		this.error(
			new NetworkError({
				message: `${xhttp.status}: ${xhttp.statusText}`,
			}).message,
		);

		return false;
	}
}
