'use strict';
var childProcess = require('child_process');
var latestPush = require('latest-push');
var Promise = require('pinkie-promise');
var tempfile = require('tempfile');
var del = require('del');
var moment = require('moment-timezone');

function clone(repo, dest) {
	var gitUrl = 'git://github.com/' + repo + '.git';
	childProcess.execSync('git clone ' + gitUrl + ' ' + dest, {stdio: [undefined, undefined, undefined]});
}

function extractOffset(push, dir) {
	clone(push.repo.name, dir);

	return childProcess.execSync('cd ' + dir + '; git log -1 --format="%aI" ' + push.payload.commits[0].sha, {encoding: 'utf8', stdio: [undefined, undefined, undefined]});
}

function clean(dir) {
	del.sync(dir, {force: true});
}

module.exports = function (user, opts) {
	if (typeof user !== 'string') {
		return Promise.reject(new TypeError('Expected a user'));
	}

	opts = opts || {};
	opts.pages = 10;

	var dir = tempfile();

	return latestPush(user, opts)
		.then(function (push) {
			var offset = extractOffset(push, dir);

			clean(dir);

			return moment.utc().utcOffset(offset).format();
		})
		.catch(function (err) {
			clean(dir);

			throw err;
		});
};
