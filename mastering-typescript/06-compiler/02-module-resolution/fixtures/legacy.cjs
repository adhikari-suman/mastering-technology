// A genuine CommonJS module. No types of its own — legacy.d.cts supplies them.
module.exports = {
  format: 'cjs',
  shout: (text) => `${String(text).toUpperCase()}!`,
};
