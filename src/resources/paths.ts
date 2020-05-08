import * as pathTool from 'path';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			__cachedCompiledPaths: typeof paths;
		}
	}
}

const paths = {
	internal: {
		LOG_FILE: './stuff/.log',
		HASHTAGS_FILE: './stuff/hashtags.csv',
		WORDS_FILE: './stuff/words.csv',
		STATE_FILE: './stuff/state.json',
		CREDENTIALS_FILE: './stuff/credentials.json',
		BOLD_FONT_FILE: './stuff/fonts/Montserrat-Bold.ttf',
		REGULAR_FONT_FILE: './stuff/fonts/Montserrat-Regular.ttf',
	},
};

// exports the paths after they're 'compiled'
// from the outside, the result should be treated as a constant
export default __compilePaths() as typeof paths;

function __compilePaths(): Record<string, any> {
	if (global.__cachedCompiledPaths) {
		return global.__cachedCompiledPaths;
	}

	const unresolvedPathsObj = paths;
	const resolvedPathsObj = paths;
	let tree = '';
	let frozenTree = null;

	// using es6 function declaration as it accesses outer variables,
	// thought it might look more logical like this
	const iterateCallback = (key: string, value: Record<string, any> | string): void => {
		if (value instanceof Object) {
			if (key === 'win32'
				|| key === 'darwin'
				|| key === 'linux') {
				if (key === process.platform) {
					// store the current tree so it'll be used later instead
					frozenTree = tree;
				} else {
					// return if it's not the current os's path
					return;
				}
			}
			// adds the level of iteration for object into 'tree'
			// eg. ['chrome']['executable']['win32']
			tree += `['${key}']`;

			// uses recursion to go deeper into the object
			iterate(value, iterateCallback);

			// removes the last level of iteration after one whole object is iterated through
			tree = tree.split('[').slice(0, -1).join('[');
			return;
		}
		// turn the slashes to correct directions for current os
		// 'resolvedPath' is used in the final eval
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const resolvedPath = value.substr(0, 2) === './'
			// transform './' into an absolute path
			// assumes this file is one level below ./ (./resources/paths)
			? pathTool.resolve(`${__dirname}/..${value.substr(1)}`)
			: pathTool.resolve(value);

		// if ti's a value, then use it's "key" string as the notation
		// because it's javascript,
		// ['0'], works (for array indexes)
		// ['bruh'], works (for object keys)
		// ['bruh']['0'], works (for both)
		const index = `['${key}']`;
		const computedPropertyName = frozenTree || `${tree}${index}`;

		if (computedPropertyName === frozenTree) {
			// clear any frozen trees so it won't be used instead of the tree next time
			frozenTree = null;
		}

		// assigns the object's items at the current level
		// eg. resolvedPathsObj['chrome']['executable']['windows'] = 'foo'
		// eslint-disable-next-line no-eval
		eval(`resolvedPathsObj${computedPropertyName} = resolvedPath`);
	};

	iterate(unresolvedPathsObj, iterateCallback);

	global.__cachedCompiledPaths = resolvedPathsObj;

	return resolvedPathsObj;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function iterate(obj, callback = (key, value, index): void => {}): void {
		Object.keys(obj).forEach((key, i) => {
			callback(key, obj[key], i);
		});
	}
}
