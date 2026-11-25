import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  linkedSignal,
  output
} from '@angular/core';

@Component({
  selector: 'app-signal-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="counter-card">
      <h3>{{ title() }}</h3>
      <p class="current-value">Current: {{ count() }}</p>
      <p class="doubled-value">Doubled: {{ doubledCount() }}</p>

      <div class="actions">
        <button type="button" (click)="decrement()" [disabled]="count() <= minLimit()">-</button>
        <button type="button" (click)="increment()" [disabled]="count() >= maxLimit()">+</button>
        <button type="button" (click)="reset()">Reset</button>
      </div>
    </div>
  `
})
export class SignalCounterComponent {
  readonly title = input<string>('Counter');
  readonly minLimit = input<number>(0);
  readonly maxLimit = input<number>(100);

  readonly thresholdReached = output<number>();

  // linkedSignal resets count whenever minLimit input changes while remaining locally writable
  readonly count = linkedSignal(() => this.minLimit());
  readonly doubledCount = computed(() => this.count() * 2);

  increment(): void {
    if (this.count() < this.maxLimit()) {
      this.count.update((val) => val + 1);
      if (this.count() === this.maxLimit()) {
        this.thresholdReached.emit(this.count());
      }
    }
  }

  decrement(): void {
    if (this.count() > this.minLimit()) {
      this.count.update((val) => val - 1);
    }
  }

  reset(): void {
    this.count.set(this.minLimit());
  }
}
