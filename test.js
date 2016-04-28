import test from 'ava';
import moment from 'moment-timezone';
import Configstore from 'configstore';
import {name as pkgName} from './package.json';
import fn from './';

const conf = new Configstore(pkgName);

test.before(() => {
	conf.clear();
});

test('error', t => {
	t.throws(fn(), 'Expected a user');
});

test('result', async t => {
	const time = await fn('SamVerschueren');

	t.is(conf.get('SamVerschueren'), moment().tz('Europe/Brussels').format());
	t.is(time, moment().tz('Europe/Brussels').format());
});
