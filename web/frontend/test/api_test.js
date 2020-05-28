import { describe, it } from 'mocha';
import assert from 'assert';
import { merge } from '../js/API';

describe('API.merge', () => {
  it('should merge booleans', () => {
    assert.equal(merge(false, false), false);
    assert.equal(merge(true, false), true);
    assert.equal(merge(false, true), true);
    assert.equal(merge(true, true), true);
  });

  it('should merge plain objects', () => {
    assert.deepEqual(merge({}, {}), {});
    assert.deepEqual(merge({ a: true }, {}), { a: true });
    assert.deepEqual(merge({}, { a: true }), { a: true });
    assert.deepEqual(merge({ a: true }, { b: true }), { a: true, b: true });
    assert.deepEqual(merge({ a: true }, { a: false }), { a: true });
    assert.deepEqual(merge({ a: false }, { a: true }), { a: true });
    assert.deepEqual(merge({ a: false }, { a: false }), { a: false });
    assert.deepEqual(merge({ user: {} }, { user: { stats: true } }), {
      user: { stats: true },
    });
    assert.deepEqual(merge({ user: { stats: true } }, { user: {} }), {
      user: { stats: true },
    });
    assert.deepEqual(merge({ record: { user: {} } }, {}), {
      record: { user: {} },
    });
    assert.deepEqual(merge({ record: { user: {} } }, { record: {} }), {
      record: { user: {} },
    });
  });
});
