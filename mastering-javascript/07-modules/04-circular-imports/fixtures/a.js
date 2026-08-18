// Half of a circular pair. Imports b, and b imports a.
import { bValue, callB } from './b.js';

export const aValue = 'a';
export function callA() { return `a -> ${callB()}`; }
export function readBAtCallTime() { return bValue; }

// Evaluated while b is still mid-evaluation, so this captures b's state
// at the moment a's body ran.
export const bValueSeenDuringEvaluation = bValue;
