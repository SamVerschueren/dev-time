import test from 'ava';
import moment from 'moment';
import Configstore from 'configstore';
import fn from './';
import {name as pkgName} from './package.json';

const conf = new Configstore(pkgName);

test.after(() => {
	conf.clear();
});

test('error', async t => {
	await t.throws(fn(), 'Expected a user');
});

test('result', async t => {
	const time = await fn('SamVerschueren');

	t.is(conf.get('SamVerschueren'), moment().format());
	t.is(time, moment().format());
});
