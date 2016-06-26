import test from 'ava';
import moment from 'moment-timezone';
import Conf from 'conf';
import m from './';

const conf = new Conf();

test.beforeEach(() => {
	conf.clear();
});

test('error', t => {
	t.throws(m(), 'Expected a user');
});

test('result', async t => {
	const time = await m('SamVerschueren');

	t.is(conf.get('SamVerschueren'), moment().tz('Europe/Brussels').format());
	t.is(time, moment().tz('Europe/Brussels').format());
});
