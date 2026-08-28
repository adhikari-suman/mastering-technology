/**
 * Real decorator syntax, type-checked by tsc and never loaded by Node.
 *
 * `node --test` only picks up `*.test.ts` in the Lesson folder, and the test
 * file reaches this one with `import type`, which erases completely. So this
 * file is checked and never parsed by a runtime that cannot parse it.
 *
 * Run `node fixtures/decorated.ts` to see it fail, and where.
 */
import { logged, bound, clamped, sealed } from '../solution.ts';

@sealed
export class Player {
  @clamped(0, 10)
  volume = 99;

  name: string;

  constructor(name: string) {
    this.name = name;
  }

  @logged
  greet(greeting: string): string {
    return `${greeting}, ${this.name}`;
  }

  @bound
  describe(): string {
    return `${this.name} at ${this.volume}`;
  }
}

/**
 * The point of the fixture: these call sites prove the decorators preserved the
 * signatures. If `logged` were typed with `Function`, `greet` would be
 * `(...args: any[]) => any` here and none of this would be checked.
 */
export type GreetType = typeof Player.prototype.greet;
export type VolumeType = typeof Player.prototype.volume;
export type PlayerCtor = typeof Player;
