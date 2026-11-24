import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject
} from '@angular/core';

interface NotificationService {
  notify(message: string): void;
}

const NOTIFICATION_TOKEN = 'NOTIFICATION_SERVICE_TOKEN';

@Component({
  selector: 'app-signal-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="counter-card">
      <h3>{{ title() }}</h3>
      <p class="current-value">Current: {{ count() }}</p>
      <p class="doubled-value">Doubled: {{ doubledCount() }}</p>

      <div class="actions">
        <button (click)="decrement()" [disabled]="count() <= minLimit()">-</button>
        <button (click)="increment()" [disabled]="count() >= maxLimit()">+</button>
        <button (click)="reset()">Reset</button>
      </div>
    </div>
  `
})
export class SignalCounterComponent {
  readonly title = input<string>('Counter');
  readonly minLimit = input<number>(0);
  readonly maxLimit = input<number>(100);

  readonly thresholdReached = output<number>();

  readonly count = signal<number>(0);
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
