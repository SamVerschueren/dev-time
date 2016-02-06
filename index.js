'use strict';
var childProcess = require('child_process');
var latestPush = require('latest-push');
var pify = require('pify');
var Promise = require('pinkie-promise');
var tempfile = require('tempfile');
var del = require('del');
var moment = require('moment-timezone');
var objectAssign = require('object-assign');
var Configstore = require('configstore');
var pkg = require('./package.json');

var execFileP = pify(childProcess.execFile.bind(childProcess), Promise);
var conf = new Configstore(pkg.name);

function clone(repo, dest) {
	return execFileP('git', ['clone', '--template=""', 'https://github.com/' + repo + '.git', dest], {stdio: 'ignore'});
}

function extractOffset(push, dir) {
	return clone(push.repo.name, dir)
		.then(function () {
			return execFileP('git', ['log', '-1', '--format="%aI"', '--ignore-missing', push.payload.commits.pop().sha], {encoding: 'utf8', cwd: dir});
		})
		.then(function (offset) {
			return offset.trim();
		});
}

function clean(dir) {
	return del(dir, {force: true});
}

function fetchPush(user, opts) {
	return clean(opts.dir)
		.then(function () {
			return latestPush(user, opts);
		})
		.then(function (push) {
			opts.exclude.push(push.id);

			return extractOffset(push, opts.dir);
		})
		.then(function (offset) {
			if (offset === '') {
				return fetchPush(user, opts);
			}

			return offset;
		});
}

module.exports = function (user, opts) {
	if (typeof user !== 'string') {
		return Promise.reject(new TypeError('Expected a user'));
	}

	var stored = conf.get(user);

	if (stored && moment().isSame(stored, 'day')) {
		return Promise.resolve(moment.utc().utcOffset(stored).format());
	}

	opts = objectAssign({exclude: []}, opts, {pages: 10, dir: tempfile()});

	return fetchPush(user, opts)
		.then(function (offset) {
			var date = moment.utc().utcOffset(offset).format();

			conf.set(user, date);

			return clean(opts.dir).then(function () {
				return date;
			});
		})
		.catch(function (err) {
			clean(opts.dir);

			throw err;
		});
};
