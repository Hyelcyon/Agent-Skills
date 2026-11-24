interface CounterOptions {
  initialCount?: number;
  step?: number;
  max?: number;
}

class CounterModel {
  count = $state(0);
  step = $state(1);
  max = $state<number | undefined>(undefined);

  doubled = $derived(this.count * 2);
  isAtMax = $derived(this.max !== undefined && this.count >= this.max);

  constructor(options: CounterOptions = {}) {
    if (options.initialCount !== undefined) {
      this.count = options.initialCount;
    }
    if (options.step !== undefined) {
      this.step = options.step;
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
    this.count -= this.step;
  }

  reset(newCount: number = 0): void {
    this.count = newCount;
  }
}

export { CounterModel };
export type { CounterOptions };
