# urmomeverything

(not) a bot that posts "ur mom " + a word, hourly, onto Instagram

### Hello 2.0!

A complete rewrite that's now in Typescript.

* Robust logging
* Error handling everywhere
* Linted (as ridiculous as it sounds)
* Proper state storage (good for not getting banned again, oops!)
* Basically written properly this time (ES2020, classes, types, hopes and dreams...)



### What it does

TL;DR:

* Use [`node-schedule`](https://github.com/node-schedule/node-schedule) to schedule a cron job every hour, then waits a random number of milliseconds every hour (`0-600000`) to execute the payload
* Use [`node-canvas`](https://github.com/Automattic/node-canvas) to generate the main image to upload
* Use [`Oxford Dictionaries API`](https://developer.oxforddictionaries.com) to retrieve the definition of the word that is put into the caption
* Use [`instagram-private-api`](https://github.com/dilame/instagram-private-api) to login & upload to Instagram



### Setting up credentials

Instagram credentials & Oxford Dictionary API keys are required.

```json
// example of ./stuff/credentials.json:

{
	"ig": {
		"id": "email",
		"key": "password"
	},
	"oxford": {
		"id": "dictId (https://developer.oxforddictionaries.com)",
		"key": "apiKey (https://developer.oxforddictionaries.com)"
	}
}
```



### Building

It should be plug and play with `tsconfig.json`



### Contributing

If you fork this repo and find ways to make improvements (or find one of the probably many bugs), feel free to submit a pull request!