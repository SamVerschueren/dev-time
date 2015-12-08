'use strict';
var childProcess = require('child_process');
var latestPush = require('latest-push');
var pify = require('pify');
var Promise = require('pinkie-promise');
var tempfile = require('tempfile');
var del = require('del');
var moment = require('moment-timezone');
var objectAssign = require('object-assign');

var dir;

function clone(repo, dest) {
	return pify(childProcess.execFile.bind(childProcess), Promise)('git', ['clone', 'https://github.com/' + repo + '.git', dest], {stdio: 'ignore'});
}

function extractOffset(push, dir) {
	return clone(push.repo.name, dir)
		.then(function () {
			return pify(childProcess.execFile.bind(childProcess), Promise)('git', ['log', '-1', '--format="%aI"', '--ignore-missing', push.payload.commits[0].sha], {encoding: 'utf8', cwd: dir});
		})
		.then(function (offset) {
			return offset.trim();
		});
}

function clean(dir) {
	del.sync(dir, {force: true});
}

function fetchPush(user, opts) {
	var pushId;

	dir = tempfile();

	return latestPush(user, opts)
		.then(function (push) {
			pushId = push.id;

			return extractOffset(push, dir);
		})
		.then(function (offset) {
			if (offset === '') {
				clean(dir);

				opts.exclude.push(pushId);
				return fetchPush(user, opts);
			}

			return offset;
		});
}

module.exports = function (user, opts) {
	if (typeof user !== 'string') {
		return Promise.reject(new TypeError('Expected a user'));
	}

	opts = objectAssign({exclude: []}, opts, {pages: 10});

	return fetchPush(user, opts)
		.then(function (offset) {
			clean();

			return moment.utc().utcOffset(offset).format();
		})
		.catch(function (err) {
			clean();

			throw err;
		});
};
