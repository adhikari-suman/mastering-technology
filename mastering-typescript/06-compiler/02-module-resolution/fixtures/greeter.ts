/** A genuine ES module. Imported by name, with the extension spelled out. */
export const format = 'esm';
export function greet(name: string): string {
  return `hello ${name}`;
}
export default greet;
