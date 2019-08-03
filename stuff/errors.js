class ErrorGetWords {
	constructor() {
		this.ReadError = class extends Error {
			constructor() {
				super(`getWords: Failed to read from ${__dirname}//stuff//words.txt`);
				Error.captureStackTrace(this, ErrorGetWords);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`getWords: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorGetWords);
			}
		};
	}
}

class ErrorGetHashtags {
	constructor() {
		this.ReadError = class extends Error {
			constructor() {
				super(`getHashtags: Failed to read from ${__dirname}//stuff//hashtags.txt`);
				Error.captureStackTrace(this, ErrorGetHashtags);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`getHashtags: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorGetHashtags);
			}
		};
	}
}

class ErrorIncrementIndex {
	constructor() {
		this.WriteError = class extends Error {
			constructor() {
				super(`incrementIndex: Failed to write to ${__dirname}//stuff//.index`);
				Error.captureStackTrace(this, ErrorIncrementIndex);
			}
		};
		this.ReadError = class extends Error {
			constructor() {
				super(`incrementIndex: Failed to read from ${__dirname}//stuff//.index`);
				Error.captureStackTrace(this, ErrorIncrementIndex);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`incrementIndex: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorIncrementIndex);
			}
		};
	}
}

class ErrorGetIndex {
	constructor() {
		this.WriteError = class extends Error {
			constructor() {
				super(`getIndex: Failed to write to ${__dirname}//stuff//.index`);
				Error.captureStackTrace(this, ErrorGetIndex);
			}
		};
		this.ReadError = class extends Error {
			constructor() {
				super(`getIndex: Failed to read from ${__dirname}//stuff//.index`);
				Error.captureStackTrace(this, ErrorGetIndex);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`getIndex: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorGetIndex);
			}
		};
	}
}

class ErrorDoesImageExistIG {
	constructor() {
		this.EmptyURL = class extends Error {
			constructor() {
				super('doesImageExistIG: Empty input URL');
				Error.captureStackTrace(this, ErrorDoesImageExistIG);
			}
		};
		this.NotFound = class extends Error {
			constructor() {
				super('doesImageExistIG: Something went wrong, image doesn\'t exist');
				Error.captureStackTrace(this, ErrorDoesImageExistIG);
			}
		};
		this.Timeout = class extends Error {
			constructor() {
				super('doesImageExistIG: Timed-out');
				Error.captureStackTrace(this, ErrorDoesImageExistIG);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`doesImageExistIG: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorDoesImageExistIG);
			}
		};
	}
}

class ErrorUploadIG {
	constructor() {
		this.NotOK = class extends Error {
			constructor() {
				super('uploadIG: Response status is not OK');
				Error.captureStackTrace(this, ErrorUploadIG);
			}
		};
		this.Unknown = class extends Error {
			constructor(...args) {
				super(`uploadIG: Unknown Error: ${ args}`);
				Error.captureStackTrace(this, ErrorUploadIG);
			}
		};
	}
}

module.exports = {
	'ErrorUploadIG': ErrorUploadIG,
	'ErrorDoesImageExistIG': ErrorDoesImageExistIG,
	'ErrorGetIndex': ErrorGetIndex,
	'ErrorIncrementIndex': ErrorIncrementIndex,
	'ErrorGetHashtags': ErrorGetHashtags,
	'ErrorGetWords': ErrorGetWords
};
