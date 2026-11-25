/**
 * Configuration options for initializing a reactive CounterModel.
 */
interface CounterOptions {
  initialCount?: number;
  step?: number;
  min?: number;
  max?: number;
}

/**
 * Universal Svelte 5 reactive counter model safe for .svelte.ts modules and per-request Context injection.
 */
class CounterModel {
  count = $state(0);
  step = $state(1);
  min = $state<number | undefined>(undefined);
  max = $state<number | undefined>(undefined);

  doubled = $derived(this.count * 2);
  isAtMax = $derived(this.max !== undefined && this.count >= this.max);
  isAtMin = $derived(this.min !== undefined && this.count <= this.min);

  constructor(options: CounterOptions = {}) {
    if (options.initialCount !== undefined) {
      this.count = options.initialCount;
    }
    if (options.step !== undefined) {
      this.step = options.step;
    }
    if (options.min !== undefined) {
      this.min = options.min;
    }
    if (options.max !== undefined) {
      this.max = options.max;
    }
  }

  increment(): void {
    if (this.max !== undefined && this.count + this.step > this.max) {
      this.count = this.max;
      return;
    }
    this.count += this.step;
  }

  decrement(): void {
    if (this.min !== undefined && this.count - this.step < this.min) {
      this.count = this.min;
      return;
    }
    this.count -= this.step;
  }

  reset(newCount: number = 0): void {
    this.count = newCount;
  }
}

export { CounterModel };
export type { CounterOptions };
