export default {
	errors: {
		NO_MESSAGE_PROVIDED: 'No message provided',
		INCORRECT_ARGUMENT: 'Incorrect argument(s) provided',
		INCORRECT_USAGE: 'Incorrect usage of item',
		IO: 'Something went wrong while trying to write or read a file',
		JSON_PARSE: 'Something went wrong while trying to parse JSON data',
		PUBLISH: 'Something went wrong while trying to publish to Instagram',
		NETWORK: 'Something went wrong while trying to make a network request',
		TIME: 'Time makes no sense',
	},
	stateService: {
		info: {
			READ_SUCCESS: 'Successfully read state from file',
			WRITE_SUCCESS: 'Successfully written state to file',
			GET_PROPERTY_SUCCESS: 'Successfully gotten property',
			SET_PROPERTY_SUCCESS: 'Successfully set property',
		},
		warn: {},
		error: {
			READ_FAIL: 'Failed to read state from file',
			WRITE_FAIL: 'Failed to write state to file',
		},
		ask: {},
	},
	wordsService: {
		info: {
			READ_SUCCESS: 'Successfully read words from file',
		},
		warn: {},
		error: {
			READ_FAIL: 'Failed to read words from file',
		},
		ask: {},
	},
	hashtagsService: {
		info: {
			READ_SUCCESS: 'Successfully read hashtags from file',
		},
		warn: {},
		error: {
			READ_FAIL: 'Failed to read hashtags from file',
		},
	},
	credentialsService: {
		info: {
			READ_SUCCESS: 'Successfully read credentials from file',
		},
		warn: {
			INCOMPLETE_CREDENTIALS: 'Not all credentials provided, things might get funky',
		},
		error: {
			READ_FAIL: 'Failed to read credentials from file',
			NO_CREDENTIALS: 'No credentials provided, things might get wonky',
		},
		ask: {},
	},
	indexService: {
		info: {
			INCREMENT: 'Incrementing index',
		},
		warn: {},
		error: {},
		ask: {},
	},
	publishService: {
		info: {
			LOGIN_START: 'Attempting to login',
			LOGIN_SUCCESS: 'Successfully logged in',
			PHOTO_START: 'Attempting to publish photo',
			PHOTO_SUCCESS: 'Successfully published photo',
			CHECKPOINT_SUCCESS: 'Successfully defeated checkpoint',
		},
		warn: {
			CHECKPOINT_START: 'A checkpoint has been encountered',
		},
		error: {
			LOGIN_FAIL: 'Failed to login',
			PHOTO_NOT_OK: 'Instagram responded with a non-ok status',
			CHECKPOINT_FAIL: 'Failed to defeat checkpoint',
		},
		ask: {
			CHECKPOINT_CODE: 'Please input the code sent to your email/phone',
		},
	},
	dictionaryService: {
		info: {
			DEFINITION_PLACEHOLDER: 'idk',
			DEFINE_START: 'Attempting to get definition from Oxford API',
			DEFINE_SUCCESS: 'Successfully gotten definition from Oxford API',
			DEFINITION_FOUND: 'Found definition',
			DEFINITION_NOT_FOUND: 'Could not find definition',
		},
		warn: {},
		error: {
			DEFINE_FAIL: 'Failed to get definition from Oxford API',
		},
		ask: {},
	},
	timekeeper: {
		info: {
			SLEEPING: 'zzz',
		},
		warn: {},
		error: {},
		ask: {},
	},
	auditor: {
		info: {
			AUDIT_PUBLISH_START: 'Attempting to audit publish results',
			AUDIT_PUBLISH_SUCCESS: 'Audit successful, the publish is live',
		},
		warn: {
			NO_NETWORK: '*insert dinosaur*, retrying for network',
		},
		error: {
			AUDIT_PUBLISH_FAIL: 'Audit failed, the publish had most likely gone wrong somewhere',
		},
		ask: {},
	},
	__boiler: {
		info: {},
		warn: {},
		error: {},
		ask: {},
	},
	general: {
		YES: 'Yes',
		NO: 'No',
		EXIT: 'Exit',
		EATEN_COOKIES: 'burp!',
	},
};
