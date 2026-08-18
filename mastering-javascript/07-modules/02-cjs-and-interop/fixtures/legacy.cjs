// A CommonJS module, loaded from ESM via createRequire.
let count = 0;
module.exports = {
  name: 'legacy',
  increment() { count += 1; return count; },
  getCount() { return count; },
};
