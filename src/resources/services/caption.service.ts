import {
	DictionaryService,
	HashtagsService,
} from '../services.js';

export class CaptionService {
	public static async get(word: string): Promise<string> {
		return `ur mom ${word}
		.
		
		what it means: ${await DictionaryService.define(word)}
		.
		
		#urmom${word} #urmum${word} ${(await HashtagsService.getRandom(20)).join(' ')}`
			.replace(/\t/g, '');
	}
}
