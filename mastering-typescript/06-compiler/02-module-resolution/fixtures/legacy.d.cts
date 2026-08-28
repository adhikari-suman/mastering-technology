/**
 * Hand-written types for legacy.cjs.
 *
 * `export =` is the CommonJS shape: the module IS this object, rather than
 * having named exports. Under `nodenext` that means callers get it as a default
 * import, and destructuring named members off it is an error.
 */
declare const legacy: {
  format: 'cjs';
  shout(text: string): string;
};
export = legacy;
