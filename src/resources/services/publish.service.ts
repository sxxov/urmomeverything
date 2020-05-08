import {
	IgApiClient,
	IgCheckpointError,
	IgChallengeWrongCodeError,
	MediaRepositoryConfigureResponseRootObject,
	IgLoginRequiredError,
} from 'instagram-private-api';
import inquirer from 'inquirer';
import {
	CredentialsService,
	StateService,
} from '../services.js';
import { LogUtility } from '../utilities/log.utility.js';
import strings from '../strings.js';
import {
	ErrorWrapper,
	PublishError,
} from '../errors.js';
import { StateItem } from './state.service.js';

const ig = new IgApiClient();

export class PublishService extends LogUtility {
	public static stateProperty = 'ig';

	public static async photo(buffer: Buffer, caption: string): Promise<string> {
		this.log(`${strings.publishService.info.PHOTO_START}: ${buffer.length}B`);

		await this.loadState();

		let result: MediaRepositoryConfigureResponseRootObject = null;
		let url: string = null;

		try {
			result = await ig.publish.photo({
				file: buffer,
				caption,
			});

			url = `https://www.instagram.com/p/${result.media.code}/`;

			this.log(`${strings.publishService.info.PHOTO_SUCCESS}: ${url}`);
		} catch (err) {
			if (err instanceof IgLoginRequiredError) {
				await this.login();

				return this.photo(buffer, caption);
			}

			throw new ErrorWrapper(err);
		}

		if (result.status !== 'ok') {
			throw new PublishError({
				message: `${strings.publishService.error.PHOTO_NOT_OK}: ${result.status}`,
			});
		}

		return url;
	}

	public static async loadState(): Promise<void> {
		if (!StateService.get<typeof StateItem.ig>(this.stateProperty)) {
			return;
		}

		await ig.state.deserialize(StateService.get<typeof StateItem.ig>(this.stateProperty));
	}

	private static subscribeToState(): void {
		ig.request.end$.subscribe(async () => {
			const {
				cookies,
			}: {
				cookies: string;
			} = await ig.state.serialize();

			await StateService.set<typeof StateItem.ig>(this.stateProperty, cookies);
		});
	}

	public static async login(): Promise<void> {
		this.subscribeToState();

		try {
			const {
				id,
				key,
			} = await CredentialsService.get('ig');

			this.log(`${strings.publishService.info.LOGIN_START}: ${id}`);

			ig.state.generateDevice(id);

			await ig.simulate.preLoginFlow();
			const profile = await ig.account.login(id, key);
			process.nextTick(async () => ig.simulate.postLoginFlow());

			this.log(`${strings.publishService.info.LOGIN_SUCCESS}: ${profile.username}`);
		} catch (err) {
			if (!(err instanceof IgCheckpointError)) {
				throw new ErrorWrapper(err);
			}

			this.warn(`${strings.publishService.warn.CHECKPOINT_START}: ${ig.state.checkpoint.message}`);

			await ig.challenge.auto(true);

			this.warn(`${strings.publishService.warn.CHECKPOINT_START}: ${ig.state.checkpoint.message}`);

			const {
				code,
			} = await inquirer.prompt([
				{
					type: 'input',
					name: 'code',
					message: strings.publishService.ask.CHECKPOINT_CODE,
				},
			]);

			try {
				await ig.challenge.sendSecurityCode(code);

				this.log(`${strings.publishService.info.CHECKPOINT_SUCCESS}: ${ig.state.checkpoint.message}`);
			} catch (error) {
				if (!(error instanceof IgChallengeWrongCodeError)) {
					throw new ErrorWrapper(error);
				}

				this.error(`${strings.publishService.error.CHECKPOINT_FAIL}: ${ig.state.checkpoint.message}`);
			}

			this.login();
		}
	}
}
