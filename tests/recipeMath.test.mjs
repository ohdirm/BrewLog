import test from 'node:test';
import assert from 'node:assert/strict';
import { formatScaledAmount, calculateWaterFromRatio } from '../src/utils/recipeMath.ts';

test('formatScaledAmount scales integers and decimals cleanly', () => {
  assert.equal(formatScaledAmount('15', 1), '15');
  assert.equal(formatScaledAmount('15', 2), '30');
  assert.equal(formatScaledAmount('15', 0.5), '7.5');
  assert.equal(formatScaledAmount('1,5', 2), '3');
  assert.equal(formatScaledAmount('secukupnya', 2), 'secukupnya');
});

test('calculateWaterFromRatio computes water grams from coffee and ratio', () => {
  assert.equal(calculateWaterFromRatio(15, 15), 225);
  assert.equal(calculateWaterFromRatio(18, 16), 288);
  assert.equal(calculateWaterFromRatio(0, 15), 0);
  assert.equal(calculateWaterFromRatio(-5, 15), 0);
});

