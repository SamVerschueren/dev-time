# dev-time [![Build Status](https://travis-ci.org/SamVerschueren/dev-time.svg?branch=master)](https://travis-ci.org/SamVerschueren/dev-time)

> Get the current local time of a GitHub user.


## Install

```
$ npm install --save dev-time
```


## Usage

```js
const devTime = require('dev-time');

devTime('SamVerschueren').then(time => {
	console.log(time);
	//=> '2015-12-07T08:34:55+01:00'
});
```


## API

### devTime(user, [options])

#### user

Type: `string`

The GitHub user to retrieve the current local time for.

#### options

##### token

Type: `string`

GitHub [access token](https://github.com/settings/tokens/new).

Can be overriden globally with the `GITHUB_TOKEN` environment variable.


## Related

- [dev-time-cli](https://github.com/SamVerschueren/dev-time-cli) - CLI for this module


## License

MIT © [Sam Verschueren](http://github.com/SamVerschueren)
