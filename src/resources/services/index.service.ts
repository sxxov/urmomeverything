import strings from '../strings.js';
import { LogUtility } from '../utilities.js';
import { StateService, StateItem } from '../services.js';

export class IndexService extends LogUtility {
	public static stateProperty = 'index';

	public static async increment(): Promise<void> {
		const index = await IndexService.get();
		const incrementedIndex = index + 1;

		this.log(`${strings.indexService.info.INCREMENT}: ${index} → ${incrementedIndex}`);

		return StateService.set(this.stateProperty, incrementedIndex);
	}

	public static async get(): Promise<number> {
		return StateService.get<typeof StateItem.index>(this.stateProperty);
	}
}
