// A real, untyped CommonJS library. No JSDoc, no types, written years ago.
// The API: get/set/del, a `stats` object, and a `create` factory.
function create(options) {
  const max = (options && options.max) || 100;
  const store = new Map();
  let hits = 0;
  let misses = 0;
  return {
    get(key) {
      if (store.has(key)) { hits++; return store.get(key); }
      misses++;
      return null;               // null, not undefined. Of course.
    },
    set(key, value) {
      if (store.size >= max && !store.has(key)) {
        store.delete(store.keys().next().value);
      }
      store.set(key, value);
      return true;
    },
    del(key) { return store.delete(key); },
    stats() { return { hits, misses, size: store.size, max }; },
  };
}
module.exports = { create };
