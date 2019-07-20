(async () => {
    
function initLog(currentTask) {
    console.clear();
    console.log(`initializing: ${currentTask}`);
}

initLog('xh2');
const XMLHttpRequest = require('xhr2');
initLog('instagram-web-api');
const igAPI = require('instagram-web-api');
initLog('request');
const request = require('request');
initLog('fs');
const fs = require('fs');
initLog('jimp');
const jimp = require('jimp');
initLog('tough-cookie-filestore2');
const FileCookieStore = require('tough-cookie-filestore2');
initLog('canvas');
const { registerFont, createCanvas } = require('canvas');
initLog('opentype.js');
const opentype = require('opentype.js');
initLog('oxford-dictionary-api');
const Dictionary = require('oxford-dictionary-api');
initLog('util');
const util = require('util');
initLog('inquirer');
const inquirer = require('inquirer');
initLog('node-schedule');
const schedule = require('node-schedule');
initLog('is-online');
const isOnline = require('is-online');

initLog('sorting out credentials');
const credentials = JSON.parse(fs.readFileSync(`${__dirname}\\stuff\\credentials.json`));
const dictID = credentials.dictID;
const dictAPI = credentials.dictAPI;
const username = credentials.username;
const password = credentials.password;
const dict = new Dictionary(dictID, dictAPI);

initLog('cookies!!1!');
const cookieStore = new FileCookieStore(`${__dirname}\\stuff\\cookies.json`);
    
initLog('igAPI');
const ig = new igAPI({ username, password, cookieStore });

initLog('getting words');
const words = await getWords().then((result) => result);

initLog('getting hashtags');
const hashtags = await getHashtags().then((result) => result);
    
initLog('miscellanious things');
var canvas;
var data;
var buffer;
var i;
var args = process.argv.slice(2);
var currentHour;
var working;
var challenge = {};
var error;

console.log = (d) => { 
	process.stdout.write(util.format(d) + '\n');
	try {
		fs.appendFileSync(`${__dirname}\\stuff\\.nodelog`, util.format(d) + '\n');
	} catch (err) {}
};

if (args[0] == '-f') {
    console.clear();
    await init();
    die(1);
}


await loop();
	
async function init() {
	return new Promise(async (resolve) => {
        i = await getIndex();
	    console.log(`init: working for: ${words[i]}`);
		registerFont(`${__dirname}\\fonts\\Montserrat-Regular.ttf`, { family: 'Montserrat-Regular' });
		registerFont(`${__dirname}\\fonts\\Montserrat-Bold.ttf`, { family: 'Montserrat-Bold' });
		let black = (((i % 3) == 0 && (i % 2) == 0) || (((i + 1) % 3) == 0 && ((i + 1) % 2) == 0) || (((i + 2) % 3) == 0 && ((i + 2) % 2) == 0)) ? true : false;
		await testInternet();
		await createIMG(words[i], `${__dirname}\\stuff\\oof.jpg`, black);	
		await loginIG();
        let imgUrl = 
            await uploadIG(`${__dirname}\\stuff\\oof.jpg`);
		await doesImageExistIG(imgUrl)
            .then(async () => {
                await incrementIndex();
        })
            .catch(() => {
                console.log('incrementIndex: not incrementing index');
        });
        let currentHour = getCurrentHour();
        await fs.writeFile(`${__dirname}\\stuff\\.lastrun`, currentHour, (err) => { return err ? console.log(err) : false });
        console.log('\n');
		resolve();
        return;
	});
}
    
async function loop() {
    initLog('starting loop');
    let lastrun = fs.readFileSync(`${__dirname}\\stuff\\.lastrun`);
        lastrun = lastrun.toString();
    let randomMillis = randomInt(0, 600000);
    let currentHour = getCurrentHour();
    let hour = parseInt(getCurrentHour()) + 1;
    console.clear();
    if (lastrun != currentHour && getCurrentMin() <= 10) {
        await init();
    }
    console.log(`zzz ${to12Hr(hour + ':' + millisToMinsAndSecs(randomMillis))}`);
    var job = await schedule.scheduleJob(`0 0 */1 * * *`, async () => {
                await sleep(randomMillis);
                if (getCurrentHour() == hour && getCurrentMin() == millisToMins(randomMillis)) {
                    await init();
                } else {
                    console.log('loop: time makes no sense')
                    console.log(`loop: 
    hours: ${getCurrentHour()} != ${hour} 
    && 
    minutes: ${getCurrentMin()} != ${millisToMins(randomMillis)} \(of ${randomMillis}\)
`);
                }
                randomMillis = randomInt(0, 600000);
                hour = parseInt(getCurrentHour()) + 1;
                console.log(`zzz ${to12Hr(hour + ':' + millisToMinsAndSecs(randomMillis))}`);
            });
}

function getCurrentMin() {
    let date = new Date();
    let currentMin = '0' + date.getMinutes();
    return currentMin.substring(currentMin.length - 2);
}    

function getCurrentHour() {
    let date = new Date();
    let currentHour = '0' + date.getHours();
    return currentHour.substring(currentHour.length - 2);
}
    
function to12Hr(time) {
    let hour = time.substring(0, 2);
    if (hour > 12) {
        hour = hour - 12;
        return hour + time.substring(2) + ' PM';
    } else return ('0' + time).substring(-2) + ' AM';
}
    
function millisToMinsAndSecs(millis) {
    let minutes = '0' + Math.floor(millis / 60000);
        minutes = minutes.substring(minutes.length - 2);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
    
function millisToMins(millis) {
    let minutes = '0' + Math.floor(millis / 60000);
    return minutes.substring(minutes.length - 2);
}

function millisToSecs(millis) {
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds < 10 ? '0' : '') + seconds;
}

async function testInternet() {
	return new Promise(async (resolve) => {
        for (let i = 0; true; i++) {
            if (await isOnline({ timeout: 10000 })) {
                resolve();
                return;
            } else {
                console.log('testInternet: *insert dinosaur*');
            }
        }
	});
}
	
async function getDefinition(word) {
	return new Promise(resolve => {
		dict.find(word, async (error, data) => {
			if (error) {
                dict.find(word.substring(0, word.length - 1), async (error, data) => {
                    if (error) { 
                        dict.find(word.substring(0, word.length - 3), async (error, data) => {
                            if (error) { 
                                resolve('idk'); 
                            } else {
                                try {
                                    resolve(data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]);
                                } catch (e) { 
                                    resolve('idk');
                                } 
                            }
                        });
                    } else {
                        try {
                            resolve(data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]);
                        } catch (e) { 
                            resolve('idk');
                        } 
                    }
                });
			} else {
				try {
					resolve(data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]);
				} catch (e) { 
                    resolve('idk');
                }
			}
			
            return;
		});
	});
}
	
async function convertToJpgIG(photo) {
	jimp.read(`${__dirname}\\stuff\\${photo}`)
		.then(lenna => {
		console.log(`convertToJpgIG: ${photo} => ${photo.split('.')[0]}.jpg`);
		return lenna
			.write(photo.split('.')[0] + '.jpg');
		})
		.catch(err => {
			console.error(err);
	});
}
	
async function uploadIG(uri) {
	console.log(`uploadIG: uploading: ${uri}`);
	let definition = await getDefinition(words[i]).then((result) => result);
    let media;
    try {
        media = await ig.uploadPhoto({ 
            photo: uri, 
            caption: `ur mom ${words[i]}
.

what it means: ${definition}
.

#urmom${words[i]} #urmum${words[i]} ${randomHashtags()}`});
        console.log(`uploadIG: upload function complete`);
        return `https:\\www.instagram.com/p/${media.media.code}/`; 
    } catch (e) {
        console.log(`uploadIG: error`);
        console.log(e);
        //die();
    }
}

async function loginIG() {
	console.log('loginIG: logging in');
	try {
		let response = await ig.login();
		if (!response.authenticated) {
			console.log('loginIG: failed to login');
			//throw null;
		}
		const profile = await ig.getProfile();

		console.log(`loginIG: logged in as: ${profile.username}`);
	} catch (e) {
		let json = JSON.parse(e.message.substring(6));
		console.log(json.message);
		if (json.message == 'checkpoint_required') {
			await doChallengeIG(json.checkpoint_url);
		}
		//die();
	}
}
	
async function doesImageExistIG(url) {
	return new Promise((resolve, reject) => {
		console.log('doesImageExistIG: verifying if the image uploaded correctly');
		let xhttp = new XMLHttpRequest();
		xhttp.open('GET', url, true);
		xhttp.onload = () => {
				if (xhttp.status == 200) {
					console.log(`doesImageExistIG: image exists!\n${url}`);
					resolve();
                    return;
				} else {
					console.log('doesImageExistIG: something went wrong, image doesn\'t exist');
                    throw false;
					//die();
				}
			};
		xhttp.send(null);
	});
}

async function doChallengeIG(checkpoint_url) {
	challenge.url = checkpoint_url;
    challenge.returnedChallenge = await ig.getChallenge({ challengeUrl: challenge.url });
    console.log(challenge.returnedChallenge);
    let choices = {
            email: [   
                { 
                    name: `Phone: ?`,
                    disabled: `Choice not available`
                },
                `Email: ${challenge.returnedChallenge.fields.email}`
            ], 
            phone: [
                `Phone: ${challenge.returnedChallenge.fields.phone}`,
                { 
                    name: `Email: ?`,
                    disabled: `Choice not available`
                },
            ],
            both: [
                `Phone: ${challenge.returnedChallenge.fields.phone}`,
                `Email: ${challenge.returnedChallenge.fields.email}`
            ]
        
        };
    let choicesAvailable = challenge.returnedChallenge.fields.choice;
    let choice;
    if (choicesAvailable.includes('1')) { 
        if (choicesAvailable.includes('0')) { 
            choice = choices.both;
        } else {
            choice = choices.email;
        }
    } else {
        choice = choices.phone;
    }
    
    await inquirer.prompt([
        {
            type: 'list',
            name: 'method',
            message: 'Method to receive verification code: ',
            choices: choice
        },
        {
            type: 'number',
            name: 'securityCode',
            message: 'Security code: ',
        }
    ]).then(async (answers) => {
        challenge.method = answers.method;
        challenge.securityCode = answers.securityCode;
        if (Number.isNaN(challenge.securityCode)) {
            console.log('Security code is not a number');
            doChallengeIG(challenge.url);
        }
        await ig.updateChallenge({ challengeUrl: challenge.url, choice: challenge.method });
        await ig.updateChallenge({ challengeUrl: challenge.url, securityCode: challenge.securityCode });
    });
}
	
async function getIndex() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\stuff\\.index`, 'utf8', (err, data) => {
			if (!err) {
				resolve(parseInt(data));
                return;
			} else {
				data = (i > 0) ? i : 0;
				fs.writeFile(`${__dirname}\\stuff\\.index`, data, (err) => {
					if (err) throw err;
				});
				resolve(data);
                return;
			}
		});
	});
}
	
async function incrementIndex() {
	return new Promise(resolve => {
		fs.writeFile(`${__dirname}\\stuff\\.index`, i + 1, (err) => {
			if (!err) {
				resolve();
                return;
			} else throw err;
		});
	});
}
	
function randomHashtags() {
    let maxHashtags = 20;
    let rnd = Math.floor(Math.random() * maxHashtags) + 3;
    let hashtagArray = shuffleArray(hashtags);
	return hashtagArray.slice(0, rnd);
}
    
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
	
async function getHashtags() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\stuff\\hashtags.txt`, 'utf8', (err, data) => {
			if (!err) {
				resolve(data.split('\r\n'));
                return;
			} else {
				throw err;
			}
		});
	});
}
	
function getWords() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\stuff\\words.txt`, 'utf8', (err, data) => {
			if (!err) {
				resolve(data.split('\r\n'));
                return;
			} else {
				throw err;
			}
		});
	});
}
	
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIMG(word, uri, black) {
	console.log('createIMG: creating image');
	let canvas = createCanvas(1920, 1920),
		ctx = canvas.getContext('2d'),
			scale = 3,
			fontSize = 69 * scale,
			fontColour = black ? 'white' : 'black',
			prefix = 'ur mom',
			boldFont = fontSize + 'px Montserrat-Bold',
			regularFont = fontSize + 'px Montserrat-Regular';
	  	
		await urMom(word);
		let buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
		fs.writeFileSync(uri, buffer);
		console.log('createIMG: image created');

		function urMom(word) {
			return new Promise(function(resolve) {
				ctx.beginPath();
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = black ? 'black' : 'white';
				ctx.fill();
				
				//debugCanvas();

				ctx.fillStyle = fontColour;
				ctx.textBaseline = 'middle'; 

				let wordWidth = getTextWidth(word, boldFont),
					prefixWidth = getTextWidth(prefix, regularFont),
					padding = (canvas.width - (prefixWidth + wordWidth)) / 2;

				if (padding > 20 * scale) {
					ctx.textAlign = 'left';

					ctx.font = regularFont;
					ctx.fillText(prefix, padding - 10 * scale, canvas.height / 2);

					ctx.font = boldFont;
					ctx.fillText(word, padding + prefixWidth + 6 * scale, canvas.height / 2);
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
					let maxTextLength = getMaxTextLength(word, boldFont, canvas.width - 40 * scale);
					if ((maxTextLength - word.length) <= 3) {
						ctx.fillText(word.substring(0, word.length / 2) + '-', canvas.width / 2, canvas.height / 2);
						ctx.fillText(word.substring(word.length / 2, word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
					} else {
						ctx.fillText(word.substring(0, maxTextLength) + '-', canvas.width / 2, canvas.height / 2);
						ctx.fillText(word.substring(maxTextLength, word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
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
					return (lengths[i - 1] != undefined) ? lengths[i - 1] : lengths[i];
				}
			}
		}

		function getTextWidth(txt, font) {
			let canvas = createCanvas(1920, 1920),
				ctx = canvas.getContext('2d');
			ctx.font = font;
			return ctx.measureText(txt).width;
		}

		function clearCanvas() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		function debugCanvas() {
			ctx.lineWidth = 6;
			ctx.strokeStyle='#000000';
			ctx.strokeRect(0, 0, canvas.width, canvas.height);

			ctx.lineWidth = 3;
			ctx.strokeStyle = 'grey';
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.stroke();
			ctx.moveTo(0, canvas.height / 2);
			ctx.lineTo(canvas.width, canvas.height / 2);
			ctx.stroke();

			let wordWidth = getTextWidth(words[index], boldFont),
				prefixWidth = getTextWidth(prefix, regularFont);
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

function die(code) {
	if (code) {
		process.exit(code);
	} else {
		process.exit();
	}
}

})();