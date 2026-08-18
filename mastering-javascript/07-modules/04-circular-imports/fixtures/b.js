import { aValue } from './a.js';

export const bValue = 'b';
export function callB() { return 'b'; }
export function readAAtCallTime() { return aValue; }

// b is evaluated FIRST when a is the entry point, so a's bindings exist but
// are still in the temporal dead zone here.
let seen;
try { seen = aValue; } catch { seen = 'TDZ'; }
export const aValueSeenDuringEvaluation = seen;
