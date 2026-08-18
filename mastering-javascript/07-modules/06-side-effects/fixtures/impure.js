// Registers itself on import. A bundler cannot drop this safely.
globalThis.__sideEffectLog = globalThis.__sideEffectLog ?? [];
globalThis.__sideEffectLog.push('impure evaluated');
export const value = 'impure';
