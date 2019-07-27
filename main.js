(async () => {

	initLog('xh2');

	const XMLHttpRequest = require('xhr2');

	initLog('instagram-private-api');
	const {
		IgApiClient
	} = require('instagram-private-api');

	initLog('fs');
	const fs = require('fs');

	initLog('canvas');
	const {
		registerFont,
		createCanvas
	} = require('canvas');

	initLog('util');
	const util = require('util');

	initLog('inquirer');
	const inquirer = require('inquirer');

	initLog('node-schedule');
	const schedule = require('node-schedule');

	initLog('is-online');
	const isOnline = require('is-online');

	initLog('sorting out credentials');
	const credentials = JSON.parse(fs.readFileSync(`${__dirname}//stuff//credentials.json`));
	const dictID = credentials.dictID;
	const dictAPI = credentials.dictAPI;
	const username = credentials.username;
	const password = credentials.password;

	initLog('IgApiClient');
	const ig = new IgApiClient();

	initLog('getting words');
	const words = await getWords().then((result) => result);

	initLog('getting hashtags');
	const hashtags = await getHashtags().then((result) => result);

	initLog('miscellanious things');
	let index;
	let args = process.argv.slice(2);

	registerFont(`${__dirname}//fonts//Montserrat-Regular.ttf`, {
		'family': 'Montserrat-Regular'
	});
	registerFont(`${__dirname}//fonts//Montserrat-Bold.ttf`, {
		'family': 'Montserrat-Bold'
	});

	console.log = (d) => {
		process.stdout.write(`${util.format( d ) }\n`);
		try {
			fs.appendFileSync(`${__dirname}//stuff//.nodelog`, `${util.format( d ) }\n`);
		} catch (err) {
			console.log('logging: error encountered when writing log');
		}
	};

	if (args[0] === '-f') {
		console.clear();
		await init();
		die(1);
	}

	await loop();

	async function init() {
		return new Promise(async (resolve) => {
			index = await getIndex();

			console.log(`init: working for: ${words[index]}`);

			// eg, (4 + 2 == 6) % 6 == 0
			let black = !!((
				(
					((index + 0) % 6) === 0
				) || (
					((index + 1) % 6) === 0
				) || (
					((index + 2) % 6) === 0
				)
			));

			await testInternet();
			await loginIG();

			let imgUrl = await uploadIG(await createIMG(words[index], black));

			await doesImageExistIG(imgUrl)
				.then(async () => {
					try {
						await incrementIndex();
					} catch (e) {
						console.log(e);
						console.log('incrementIndex: error encountered when incrementing index');
						console.log('incrementIndex: quitting to avoid repeated same posts');
						process.exit(1);
					}
				})
				.catch((e) => {
					console.log(e);
					console.log('incrementIndex: not incrementing index');
				});

			await fs.writeFile(`${__dirname}//stuff//.lastrun`, JSON.stringify({ 'lastRun': getCurrentHour() }), (err) => {
				return err ? console.log(err) : false;
			});
			console.log('\n');
			resolve();
			return;
		});
	}

	async function loop() {
		initLog('starting loop');
		let lastRun;

		try {
			lastRun = JSON.parse(fs.readFileSync(`${__dirname}//stuff//.lastrun`)).lastRun;
		} catch (e) {
			console.log('loop: creating .lastrun');
			await fs.writeFile(`${__dirname}//stuff//.lastrun`, JSON.stringify({ 'lastRun': '' }), (err) => {
				return err ? console.log(err) : false;
			});
		}

		let randomMillis = randomInt(0, 600000);
		let currentHour = getCurrentHour();
		let hour = getNextHour();

		console.clear();
		if (lastRun !== currentHour && getCurrentMin() <= 10) {
			await init();
		}
		console.log(`zzz ${to12Hr( `${hour}:${ millisToMinsAndSecs( randomMillis )}` )}`);
		await schedule.scheduleJob('0 0 */1 * * *', async () => {
			await sleep(randomMillis);
			if (getCurrentHour() === hour && getCurrentMin() === millisToMins(randomMillis)) {
				await init();
			} else {
				console.log('loop: time makes no sense');
				console.log(`loop:
hours: ${getCurrentHour()} should be: ${hour}
minutes: ${getCurrentMin()} should be: ${millisToMins( randomMillis )} (of ${randomMillis})
`);
			}
			randomMillis = randomInt(0, 600000);
			hour = getNextHour();
			console.log(`zzz ${to12Hr( `${hour }:${ millisToMinsAndSecs( randomMillis )}` )}`);
		});
	}

	function initLog(currentTask) {
		console.clear();
		console.log(`initializing: ${currentTask}`);
	}

	function getCurrentMin() {
		let date = new Date();
		let currentMin = `0${date.getMinutes()}`;

		return currentMin.slice(-2);
	}

	function getCurrentHour() {
		let date = new Date();
		let currentHour = `0${date.getHours()}`;

		return currentHour.slice(-2);
	}

	function getNextHour() {
		let date = new Date();
		let nextHour = `0${date.getHours() + 1}`;

		return nextHour.slice(-2);
	}

	function to12Hr(time) {
		let hour = parseInt(time.substring(0, 2));

		if (hour > 12) {
			hour = hour - 12;
			return `${(`0${ hour}`).slice(-2)}${time.substring(2)} PM`;
		}
		return `${time} AM`;
	}

	function millisToMinsAndSecs(millis) {
		let minutes = `0${Math.floor(millis / 60000)}`;

		minutes = minutes.substring(minutes.length - 2);
		let seconds = ((millis % 60000) / 1000).toFixed(0);

		return `${minutes}:${seconds < 10 ? '0' : '' }${seconds}`;
	}

	function millisToMins(millis) {
		let minutes = `0${Math.floor( millis / 60000 )}`;

		return minutes.substring(minutes.length - 2);
	}

	function millisToSecs(millis) {
		let seconds = ((millis % 60000) / 1000).toFixed(0);

		return (seconds < 10 ? '0' : '') + seconds;
	}

	async function testInternet() {
		return new Promise(async (resolve) => {
			for (;;) {
				if (await isOnline({
					'timeout': 10000
				})) {
					resolve();
					return;
				}
				console.log('testInternet: *insert dinosaur*');

			}
		});
	}

	async function getDefinition(word, minWordLength) {
		console.log(`getDefinition: getting definition for: ${word}`);
		return new Promise((resolve) => {
			let xhttp = new XMLHttpRequest();

			xhttp.open('GET', `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}?fields=definitions&strictMatch=false`, true);
			xhttp.setRequestHeader('Accept', 'application/json');
			xhttp.setRequestHeader('app_id', dictID);
			xhttp.setRequestHeader('app_key', dictAPI);
			xhttp.timeout = 10000;
			xhttp.onload = async () => {
				if (xhttp.status === 200) {
					let data = JSON.parse(xhttp.response);

					try {
						let definition = data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];

						console.log(`getDefinition: ${word}: ${definition}`);
						resolve(definition);
					} catch (e) {
						resolve('idk');
					}
					return;
				}
				let otherData;

				if (minWordLength === undefined || word.length > minWordLength) {
					otherData = await getDefinition(word.substring(0, word.length - 1), minWordLength ? minWordLength : word.length - 3).then((result) => result);
					if (otherData !== 'idk') {
						resolve(otherData);
					}
				}
				resolve('idk');
				return;

			};
			xhttp.ontimeout = (e) => {
				console.log(`getDefinition: ${e}`);
				resolve('idk');
				return;
			};
			xhttp.send(null);
		});
	}

	async function uploadIG(buffer) {
		let definition = await getDefinition(words[index]).then((result) => result);

		console.log('uploadIG: uploading');
		try {
			let caption = `ur mom ${words[index]}
.

what it means: ${definition}
.

#urmom${words[index]} #urmum${words[index]} ${randomHashtags()}`;
			/*        console.log(`uploadIG:
			${caption}`)*/
			const result = await ig.publish.photo({
				'file': buffer,
				'caption': caption
			});

			let url = `https://www.instagram.com/p/${result.media.code}/`;

			console.log(`uploadIG: upload function complete: ${url}`);
			if (result.status !== 'ok') {
				throw new Error('uploadIG: upload status != ok');
			}
			return url;
		} catch (e) {
			console.log('uploadIG: error');
			console.log(e);
		}
	}

	async function loginIG() {
		console.log('loginIG: logging in');

		try {
			ig.state.generateDevice(username);
			await ig.simulate.preLoginFlow();
			const profile = await ig.account.login(username, password);

			process.nextTick(async () => await ig.simulate.postLoginFlow());

			console.log(`loginIG: logged in as: ${profile.username}`);
		} catch (e) {
			console.log(ig.state.checkpoint); // Checkpoint info here
			await ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
			console.log(ig.state.checkpoint); // Challenge info here
			const {
				code
			} = await inquirer.prompt([
				{
					'type': 'input',
					'name': 'code',
					'message': 'Enter code'
				}
			]);

			console.log(await ig.challenge.sendSecurityCode(code));
		}
	}

	async function doesImageExistIG(url) {
		return new Promise((resolve) => {
			console.log('doesImageExistIG: verifying if the image uploaded correctly');
			if (url === null || url === undefined || url === 'https://www.instagram.com/p//') {
				throw new Error('doesImageExistIG: empty url');
			}
			let xhttp = new XMLHttpRequest();

			xhttp.open('GET', url, true);
			xhttp.timeout = 10000;
			xhttp.onload = () => {
				if (xhttp.status === 200) {
					console.log(`doesImageExistIG: image exists!
${url}`);
					resolve();
					return;
				}
				throw new Error('doesImageExistIG: something went wrong, image doesn\'t exist');
				// die();

			};
			xhttp.ontimeout = (e) => {
				throw new Error(`doesImageExistIG: ${e}`);
			};
			xhttp.send(null);
		});
	}

	async function getIndex() {
		return new Promise((resolve) => {
			try {
				resolve(parseInt(JSON.parse(fs.readFileSync(`${__dirname}//stuff//.index`)).index));
				return;
			} catch (e) {
				let newIndex = { 'index': (index > 0) ? index : 0 };

				fs.writeFile(`${__dirname}//stuff//.index`, index, (errWrite) => {
					if (errWrite) {
						throw errWrite;
					}
				});
				resolve(newIndex);
				return;
			}
		});
	}

	async function incrementIndex() {
		return new Promise((resolve) => {
			fs.writeFile(`${__dirname}//stuff//.index`, JSON.stringify({ 'index': index + 1 }), (err) => {
				if (!err) {
					resolve();
					return;
				}
				throw err;
			});
		});
	}

	function randomHashtags() {
		let maxHashtags = 20;
		let rnd = Math.floor(Math.random() * maxHashtags) + 3;
		let hashtagArray = shuffleArray(hashtags);

		hashtagArray = hashtagArray.slice(0, rnd);
		return hashtagArray.join(' ');
	}

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));

			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	async function getHashtags() {
		return new Promise((resolve) => {
			fs.readFile(`${__dirname}//stuff//hashtags.txt`, 'utf8', (err, data) => {
				if (!err) {
					resolve(data.split('\r\n'));
					return;
				}
				throw err;

			});
		});
	}

	function getWords() {
		return new Promise((resolve) => {
			fs.readFile(`${__dirname}//stuff//words.txt`, 'utf8', (err, data) => {
				if (!err) {
					resolve(data.split('\r\n'));
					return;
				}
				throw err;

			});
		});
	}

	async function createIMG(word, black) {
		console.log('createIMG: creating image');
		let canvas = createCanvas(1920, 1920);
		let ctx = canvas.getContext('2d');
		let scale = 3;
		let fontSize = 69 * scale;
		let fontColour = black ? 'white' : 'black';
		let prefix = 'ur mom';
		let boldFont = `${fontSize }px Montserrat-Bold`;
		let regularFont = `${fontSize }px Montserrat-Regular`;

		await urMom(word);
		let buffer = canvas.toBuffer('image/jpeg', {
			'quality': 1
		});

		console.log('createIMG: image created');
		return buffer;

		function urMom(_word) {
			return new Promise((resolve) => {
				ctx.beginPath();
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = black ? 'black' : 'white';
				ctx.fill();

				// debugCanvas();

				ctx.fillStyle = fontColour;
				ctx.textBaseline = 'middle';

				let wordWidth = getTextWidth(_word, boldFont);
				let prefixWidth = getTextWidth(prefix, regularFont);
				let padding = (canvas.width - (prefixWidth + wordWidth)) / 2;

				if (padding > 20 * scale) {
					ctx.textAlign = 'left';

					ctx.font = regularFont;
					ctx.fillText(prefix, padding - 10 * scale, canvas.height / 2);

					ctx.font = boldFont;
					ctx.fillText(_word, padding + prefixWidth + 6 * scale, canvas.height / 2);
				} else if (wordWidth < canvas.width - 40 * scale) {
					ctx.textAlign = 'center';

					ctx.font = regularFont;
					ctx.fillText(prefix, canvas.width / 2, canvas.height / 2 - fontSize / 2 + 5 * scale);

					ctx.font = boldFont;
					ctx.fillText(word, canvas.width / 2, canvas.height / 2 + fontSize / 2 - 5 * scale);
				} else {
					ctx.textAlign = 'center';

					ctx.font = regularFont;
					ctx.fillText(prefix, canvas.width / 2, canvas.height / 2 - fontSize + 10 * scale);

					ctx.font = boldFont;
					let maxTextLength = getMaxTextLength(_word, boldFont, canvas.width - 40 * scale);

					if ((maxTextLength - word.length) <= 3) {
						ctx.fillText(`${_word.substring( 0, _word.length / 2 ) }-`, canvas.width / 2, canvas.height / 2);
						ctx.fillText(_word.substring(_word.length / 2, _word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
					} else {
						ctx.fillText(`${_word.substring( 0, maxTextLength ) }-`, canvas.width / 2, canvas.height / 2);
						ctx.fillText(_word.substring(maxTextLength, _word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
					}
				}
				resolve();
				return;
			});
		}

		function getMaxTextLength(txt, font, maxWidth) {
			let lengths = [];

			for (let i = 0; i <= txt.length; i++) {
				let str = txt.substring(0, i);
				let width = getTextWidth(str, font);

				lengths.push(str.length);
				if (width > maxWidth) {
					return (lengths[i - 1] !== undefined) ? lengths[i - 1] : lengths[i];
				}
			}
		}

		function getTextWidth(txt, font) {
			let testCanvas = createCanvas(1920, 1920);
			let testCtx = testCanvas.getContext('2d');

			testCtx.font = font;
			return testCtx.measureText(txt).width;
		}

		function clearCanvas() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		function debugCanvas() {
			ctx.lineWidth = 6;
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(0, 0, canvas.width, canvas.height);

			ctx.lineWidth = 3;
			ctx.strokeStyle = 'grey';
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.stroke();
			ctx.moveTo(0, canvas.height / 2);
			ctx.lineTo(canvas.width, canvas.height / 2);
			ctx.stroke();

			let wordWidth = getTextWidth(words[index], boldFont);
			let prefixWidth = getTextWidth(prefix, regularFont);

			ctx.moveTo((canvas.width - (prefixWidth + wordWidth)) / 2, 0);
			ctx.lineTo((canvas.width - (prefixWidth + wordWidth)) / 2, canvas.height);
			ctx.stroke();
			ctx.moveTo(canvas.width - (canvas.width - (prefixWidth + wordWidth)) / 2, 0);
			ctx.lineTo(canvas.width - (canvas.width - (prefixWidth + wordWidth)) / 2, canvas.height);
			ctx.stroke();
		}
	}

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function pause() {
		console.log('\npause: press any key to continue');
		process.stdin.setRawMode(true);
		return new Promise((resolve) => process.stdin.once('data', () => {
			process.stdin.setRawMode(false);
			resolve();
		}));
	}

	function die(code) {
		if (code) {
			process.exit(code);
		} else {
			process.exit();
		}
	}

})();
