import test from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES } from '../src/exercises.js';
import { createSession, selectSlices, submit, useHint, markAssisted, advance, answerFor } from '../src/session.js';

test('wrong answers cannot advance; solving twice cannot inflate results', () => {
  let s = createSession();
  assert.equal(advance(s), s);
  s = submit(selectSlices(s, 1));
  assert.match(s.feedback, /less/);
  assert.match(s.feedback, /same number of slices/);
  assert.equal(s.attempts, 1);
  assert.equal(s.solved, false);
  assert.equal(advance(s), s);
  s = submit(selectSlices(s, answerFor(s).n));
  assert.equal(s.solved, true);
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].firstTry, false);
  assert.equal(submit(s), s);
  assert.equal(selectSlices(s, 0), s);
});

test('hints and example visits are assistance; the next task resets assistance', () => {
  for (const assist of [useHint, markAssisted]) {
    let s = assist(createSession());
    s = submit(selectSlices(s, answerFor(s).n));
    assert.equal(s.results[0].firstTry, false);
    assert.equal(s.results[0].assisted, true);
    s = advance(s);
    assert.equal(s.assisted, false);
    assert.equal(s.selected, 0);
    assert.equal(s.attempts, 0);
  }
});

test('a full round terminates once and keeps each result, including zero and whole', () => {
  let s = createSession();
  for (let i = 0; i < CHALLENGES.length; i++) {
    assert.equal(s.index, i);
    s = submit(selectSlices(s, answerFor(s).n));
    s = advance(s);
  }
  assert.equal(s.complete, true);
  assert.equal(s.results.length, CHALLENGES.length);
  assert.equal(s.results.filter(r => r.firstTry).length, 10);
  assert.equal(advance(s), s);
  assert.equal(submit(s), s);
  assert.equal(useHint(s), s);
  assert.equal(createSession().results.length, 0);
});
