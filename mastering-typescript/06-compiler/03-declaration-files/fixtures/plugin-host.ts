/**
 * A module with an interface designed to be extended from outside — the shape
 * every plugin system ends up with.
 */
export interface PluginRegistry {
  core: { version: string };
}

const registry: Record<string, unknown> = { core: { version: '1.0.0' } };

export function register(name: string, value: unknown): void {
  registry[name] = value;
}

export function lookup(name: string): unknown {
  return registry[name];
}
