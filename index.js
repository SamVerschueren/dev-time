'use strict';
const latestPush = require('latest-push');
const tempfile = require('tempfile');
const del = require('del');
const moment = require('moment-timezone');
const Conf = require('conf');
const execa = require('execa');

const config = new Conf();

const clean = dir => del(dir, {force: true});
const clone = (repo, dest) => execa('git', ['clone', '--no-checkout', '--template=""', `https://github.com/${repo}.git`, dest], {stdio: 'ignore'});

const extractOffset = (push, dir) => {
	return clone(push.repo.name, dir)
		.then(() => execa.stdout('git', ['log', '-1', '--format="%aD"', '--ignore-missing', push.payload.commits.pop().sha], {encoding: 'utf8', cwd: dir}))
		.then(offset => offset.trim());
};

const fetchPush = (user, opts) => {
	return clean(opts.dir)
		.then(() => latestPush(user, opts))
		.then(push => {
			opts.exclude.push(push.id);

			return extractOffset(push, opts.dir);
		})
		.then(offset => {
			if (offset === '') {
				return fetchPush(user, opts);
			}

			return offset;
		});
};

module.exports = (user, opts) => {
	if (typeof user !== 'string') {
		return Promise.reject(new TypeError('Expected a user'));
	}

	const stored = config.get(user);

	if (stored && moment().isSame(stored, 'day')) {
		return Promise.resolve(moment.utc().utcOffset(stored).format());
	}

	opts = Object.assign({exclude: []}, opts, {pages: 10, dir: tempfile()});

	return fetchPush(user, opts)
		.then(offset => {
			const date = moment.utc().utcOffset(offset).format();

			config.set(user, date);

			return clean(opts.dir).then(() => date);
		})
		.catch(err => {
			return clean(opts.dir).then(() => {
				throw err;
			});
		});
};
