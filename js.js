(async () => {

const XMLHttpRequest = require('xhr2'),
	  igAPI = require('instagram-web-api'),
	  request = require("request"),
	  fs = require('fs'),
	  jimp = require('jimp'),
	  FileCookieStore = require('tough-cookie-filestore2'),
	  { registerFont, createCanvas } = require('canvas'),
	  opentype = require('opentype.js'),
	  Dictionary = require("oxford-dictionary-api"),
	  util = require('util'),
	  credentials = JSON.parse(fs.readFileSync(`${__dirname}/credentials.json`)),
	  dictID = credentials.dictID,
	  dictAPI = credentials.dictAPI,
	  username = credentials.username,
	  password = credentials.password,
	  dict = new Dictionary(dictID, dictAPI),
	  cookieStore = new FileCookieStore('./cookies.json'),
	  ig = new igAPI({ username, password, cookieStore }),
      words = await getWords().then((result) => result),
	  hashtags = await getHashtags().then((result) => result);
var canvas,
	data,
	buffer,
	i = await getIndex(),
	currentHour,
	working;
	
console.log = (d) => { 
	process.stdout.write(util.format(d) + "\n");
	try {
		fs.appendFileSync(`${__dirname}/.nodelog`, util.format(d) + "\n");
	} catch (err) {}
};

await init();
process.exit(1);
	
async function init() {
	return new Promise(async (resolve) => {
	    console.log(`init: working for: ${words[i]}`);
		registerFont(`${__dirname}/fonts/Montserrat-Regular.ttf`, { family: 'Montserrat-Regular' });
		registerFont(`${__dirname}/fonts/Montserrat-Bold.ttf`, { family: 'Montserrat-Bold' });
		let black = (((i % 3) == 0 && (i % 2) == 0) || (((i + 1) % 3) == 0 && ((i + 1) % 2) == 0) || (((i + 2) % 3) == 0 && ((i + 2) % 2) == 0)) ? true : false;
		await testInternet();
		await createIMG(words[i], "oof.jpg", black);	
		await loginIG();
		await doesImageExistIG(await uploadIG("oof.jpg"));
		await incrementIndex(); 
		resolve();
	});
}

async function testInternet() {
	return new Promise((resolve) => {
		let xhttp = new XMLHttpRequest();
		xhttp.open('GET', "http://instagram.com", true);
		xhttp.onload = () => {
				if (xhttp.status == 200) {
					resolve();
				} else {
					console.log("testInternet: unable to connect to instagram");
					process.exit();
				}
			};
		xhttp.send(null);
	});
}
	
async function getDefinition(word) {
	return new Promise(resolve => {
		dict.find(word, async (error, data) => {
			if (error) {
				data = "idk"
			} else {
				try {
					data = data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];
				} catch (e) {
					data = "idk";
				}
			}
			resolve(data);
		});
	});
}
	
async function convertToJpgIG(photo) {
	jimp.read(`${__dirname}/photo`)
		.then(lenna => {
		console.log(`convertToJpgIG: ${photo} => ${photo.split(".")[0]}.jpg`);
		return lenna
			.write(photo.split(".")[0] + ".jpg");
		})
		.catch(err => {
			console.error(err);
	});
}
	
async function uploadIG(photo) {
	console.log(`uploadIG: uploading: ${photo}`);
	photo = __dirname + "/" + photo;
	let definition = await getDefinition(words[i]).then((result) => result);
	const { media } = await ig.uploadPhoto({ 
		photo, 
		caption: `ur mom ${words[i]}
.

what it means: ${definition}
.

#urmom${words[i]} #urmum${words[i]} ${randomHashtags()}`});
	console.log(`uploadIG: upload function complete`);
	return `https://www.instagram.com/p/${media.code}/`; 
}

async function loginIG() {
	console.log("loginIG: logging in");
	let response = await ig.login();
	if (!response.authenticated) {
		console.log(`loginIG: ${response}`);
		throw null;
	}
	const profile = await ig.getProfile();

	console.log(`loginIG: logged in as: ${profile.username}`);
}
	
async function doesImageExistIG(photo) {
	return new Promise((resolve) => {
		console.log("doesImageExistIG: verifying if the image uploaded correctly");
		let xhttp = new XMLHttpRequest();
		xhttp.open('GET', photo, true);
		xhttp.onload = () => {
				if (xhttp.status == 200) {
					console.log(`doesImageExistIG: image exists!
${photo}`);
					resolve();
				} else {
					console.log("doesImageExistIG: something went wrong, image doesn't exist");
					process.exit();
				}
			};
		xhttp.send(null);
	});
}
	
async function getIndex() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\.index`, "utf8", (err, data) => {
			if (!err) {
				resolve(parseInt(data));
			} else {
				data = (i > 0) ? i : 0;
				fs.writeFile(`${__dirname}\\.index`, data, (err) => {
					if (err) throw err;
				});
				resolve(data);
			}
		});
	});
}
	
async function incrementIndex() {
	return new Promise(resolve => {
		fs.writeFile(`${__dirname}\\.index`, i + 1, (err) => {
			if (!err) {
				resolve();
			} else throw err;
		});
	});
}
	
function randomHashtags() {
	let maxHashtags = 20,
		hashtags = "";
	rnd = Math.floor(Math.random() * maxHashtags) + 3;
	for (let i = 0; i < rnd; i++) {
		hashtags += `${randomHashtag()} `;
	}
	return hashtags;
}
	
function randomHashtag() {
	let i;
	do {
		i = Math.floor(Math.random() * hashtags.length);
	} while (hashtags[i] == undefined);
	let	hashtag = hashtags[i];
	hashtags[i] = undefined;
	return hashtag;
}
	
async function getHashtags() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\hashtags.txt`, "utf8", (err, data) => {
			if (!err) {
				resolve(data.split("\r\n"));
			} else {
				throw err;
			}
		});
	});
}
	
function getWords() {
	return new Promise(resolve => {
		fs.readFile(`${__dirname}\\words.txt`, "utf8", (err, data) => {
			if (!err) {
				resolve(data.split("\r\n"));
			} else {
				throw err;
			}
		});
	});
}
	
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIMG(word, photo, black) {
	console.log("createIMG: creating image");
	let canvas = createCanvas(1920, 1920),
		ctx = canvas.getContext("2d"),
			scale = 3,
			fontSize = 69 * scale,
			fontColour = black ? "white" : "black",
			prefix = "ur mom",
			boldFont = fontSize + "px Montserrat-Bold",
			regularFont = fontSize + "px Montserrat-Regular";
	  	
		await urMom(word);
		let buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
		fs.writeFileSync(photo, buffer);
		console.log("createIMG: image created");

		function urMom(word) {
			return new Promise(function(resolve) {
				ctx.beginPath();
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = black ? "black" : "white";
				ctx.fill();
				
				//debugCanvas();

				ctx.fillStyle = fontColour;
				ctx.textBaseline = "middle"; 

				let wordWidth = getTextWidth(word, boldFont),
					prefixWidth = getTextWidth(prefix, regularFont),
					padding = (canvas.width - (prefixWidth + wordWidth)) / 2;

				if (padding > 20 * scale) {
					ctx.textAlign = "left";

					ctx.font = regularFont;
					ctx.fillText(prefix, padding - 10 * scale, canvas.height / 2);

					ctx.font = boldFont;
					ctx.fillText(word, padding + prefixWidth + 6 * scale, canvas.height / 2);
				} else if (wordWidth < canvas.width - 40 * scale) {
					ctx.textAlign = "center";

					ctx.font = regularFont;
					ctx.fillText(prefix, canvas.width / 2, canvas.height / 2 - fontSize / 2 + 5 * scale);

					ctx.font = boldFont;
					ctx.fillText(word, canvas.width / 2, canvas.height / 2 + fontSize / 2 - 5 * scale);
				} else {
					ctx.textAlign = "center";

					ctx.font = regularFont;
					ctx.fillText(prefix, canvas.width / 2, canvas.height / 2 - fontSize + 10 * scale);

					ctx.font = boldFont;
					let maxTextLength = getMaxTextLength(word, boldFont, canvas.width - 40 * scale);
					if ((maxTextLength - word.length) <= 3) {
						ctx.fillText(word.substring(0, word.length / 2) + "-", canvas.width / 2, canvas.height / 2);
						ctx.fillText(word.substring(word.length / 2, word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
					} else {
						ctx.fillText(word.substring(0, maxTextLength) + "-", canvas.width / 2, canvas.height / 2);
						ctx.fillText(word.substring(maxTextLength, word.length), canvas.width / 2, canvas.height / 2 + fontSize - 10 * scale);
					}
				}
				resolve();
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
			ctx.strokeStyle="#000000";
			ctx.strokeRect(0, 0, canvas.width, canvas.height);

			ctx.lineWidth = 3;
			ctx.strokeStyle = "grey";
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

})();