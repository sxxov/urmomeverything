import * as fs from 'fs';
import { Artist } from './core/artist.js';
import { Auditor } from './core/auditor.js';
import { Timekeeper } from './core/timekeeper.js';
import {
	IndexService,
	WordsService,
	CaptionService,
	PublishService,
} from './resources/services.js';
import { LogUtility } from './resources/utilities.js';

class Main extends LogUtility {
	public async create(): Promise<void> {
		LogUtility.addToContext(this);
		global.__logLevel = LogUtility.LOG_LEVEL.INFO;

		const handler = async (): Promise<void> => {
			await Auditor.continueOnInternet();

			const index = await IndexService.get();
			const word = await WordsService.get(index);
			const caption = await CaptionService.get(word);
			const image = new Artist().paint(word, index);

			Main.log(caption);

			fs.writeFileSync('./painted.jpg', image);

			const url = await PublishService.photo(image, caption);

			const auditResult = await Auditor.auditPublish(url);
			if (!auditResult) {
				await handler();

				return;
			}

			await IndexService.increment();
		};

		await Timekeeper.scheduleEveryHour(handler);
	}
}

(async (): Promise<void> => {
	await new Main().create();
})();
