(async () => {
    
function initLog(currentTask) {
    console.clear();
    console.log(`initializing: ${currentTask}`);
}

initLog('xh2');
const XMLHttpRequest = require('xhr2');
initLog('instagram-private-api');
const { IgApiClient } = require('instagram-private-api');
initLog('request');
const request = require('request');
initLog('fs');
const fs = require('fs');
initLog('canvas');
const { registerFont, createCanvas } = require('canvas');
initLog('opentype.js');
const opentype = require('opentype.js');
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
    
initLog('IgApiClient');
const ig = new IgApiClient();

initLog('getting words');
const words = await getWords().then((result) => result);

initLog('getting hashtags');
const hashtags = await getHashtags().then((result) => result);
    
initLog('miscellanious things');
var i;
var args = process.argv.slice(2);

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
        
		let black = // eg, (4 + 2 == 6) % 6 == 0
            (
                (
                    ((i + 0) % 6) == 0 
                ) 
            || 
                (
                    ((i + 1) % 6) == 0 
                ) 
            || 
                (
                    ((i + 2) % 6) == 0 
                )
            ) ? true : false;
        
		await testInternet();
        await loginIG();
        
        let imgUrl = 
            await uploadIG(await createIMG(words[i], black));
        
		await doesImageExistIG(imgUrl)
            .then(async () => {
                await incrementIndex();
        })
            .catch((e) => {
                console.log(e);
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
	
async function getDefinition(word, minWordLength) {
    console.log(`getDefinition: getting definition for: ${word}`);
	return new Promise(resolve => {
        let xhttp = new XMLHttpRequest();
		xhttp.open('GET', `https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}?fields=definitions&strictMatch=false`, true);
        xhttp.setRequestHeader('Accept', 'application/json');
        xhttp.setRequestHeader('app_id', dictID);
        xhttp.setRequestHeader('app_key', dictAPI);
		xhttp.onload = async () => {
				if (xhttp.status == 200) {
					let data = JSON.parse(xhttp.response);
                    try {
                        resolve(data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]);
                    } catch (e) {
                        resolve('idk');
                    }
                    return;
				} else {
                    let otherData;
                    if (minWordLength == undefined || word.length > minWordLength) {
                        otherData = await getDefinition(word.substring(0, word.length - 1), minWordLength ? minWordLength : word.length - 3).then((result) => result);
                        if (otherData != 'idk') {
                            resolve(otherData);
                        }
                    } 
                    resolve('idk');
                    return;
                }
        }
		xhttp.send(null);
	});
}
	
async function uploadIG(buffer) {
	console.log(`uploadIG: uploading`);
	let definition = await getDefinition(words[i]).then((result) => result);
    
    try {
        let caption = `ur mom ${words[i]}
.

what it means: ${definition}
.

#urmom${words[i]} #urmum${words[i]} ${randomHashtags()}`;
        console.log(`uploadIG:
${caption}`)
        const result = await ig.publish.photo({
            file: buffer, 
            caption: caption
        });
        
        let url = `https://www.instagram.com/p/${result.media.code}/`;
        console.log(`uploadIG: upload function complete: ${url}`);
        if (result.status != 'ok') {
            throw 'uploadIG: upload status != ok'
        }
        return url; 
    } catch (e) {
        console.log(`uploadIG: error`);
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
        const { code } = await inquirer.prompt([
        {
            type: 'input',
            name: 'code',
            message: 'Enter code',
        },
        ]);
        console.log(await ig.challenge.sendSecurityCode(code));
	}
}
	
async function doesImageExistIG(url) {
	return new Promise((resolve, reject) => {
		console.log('doesImageExistIG: verifying if the image uploaded correctly');
        if (url == null || url == undefined || url == 'https://www.instagram.com/p//') {
            reject();
            throw 'doesImageExistIG: empty url';
        }
		let xhttp = new XMLHttpRequest();
		xhttp.open('GET', url, true);
		xhttp.onload = () => {
				if (xhttp.status == 200) {
					console.log(`doesImageExistIG: image exists!\n${url}`);
					resolve();
                    return;
				} else {
                    reject();
                    throw 'doesImageExistIG: something went wrong, image doesn\'t exist';
					//die();
				}
			};
		xhttp.send(null);
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

async function createIMG(word, black) {
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
    console.log('createIMG: image created');
    return buffer;

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