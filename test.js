import test from 'ava';
import moment from 'moment';
import fn from './';

test('error', async t => {
	await t.throws(fn(), 'Expected a user');
});

test('result', async t => {
	const time = await fn('SamVerschueren');

	t.is(time, moment().format());
});
