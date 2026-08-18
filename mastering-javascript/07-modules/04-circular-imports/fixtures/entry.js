// Fixes the evaluation order so the cycle behaves the same however your
// solution.js is written: a.js is always the entry point, so b.js is
// evaluated first and sees a half-built a.
import * as a from './a.js';
import * as b from './b.js';

export const callA = a.callA;
export const readBAtCallTime = a.readBAtCallTime;
export const bValueSeenDuringEvaluation = a.bValueSeenDuringEvaluation;

export const callB = b.callB;
export const readAAtCallTime = b.readAAtCallTime;
export const aValueSeenDuringEvaluation = b.aValueSeenDuringEvaluation;
