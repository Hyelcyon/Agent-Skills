import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

@Component({
  selector: 'app-telemetry-chart-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="heavy-chart-rendered">
      <p>Real-time TPS: {{ transactionsPerSec() }}</p>
      <p>Memory Allocation: {{ memoryMb() }} MB</p>
    </div>
  `
})
export class TelemetryChartPanelComponent {
  readonly transactionsPerSec = input.required<number>();
  readonly memoryMb = input.required<number>();
}

@Component({
  selector: 'app-deferrable-analytics-widget',
  imports: [TelemetryChartPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="widget-container">
      <h3>System Performance Telemetry</h3>

      <!-- @defer only code-splits standalone components/directives/pipes inside the block -->
      @defer (on viewport; prefetch on idle) {
        <app-telemetry-chart-panel
          [transactionsPerSec]="transactionsPerSec()"
          [memoryMb]="memoryMb()"
        />
      } @placeholder (minimum 300ms) {
        <div class="chart-skeleton">Chart viewport loading placeholder</div>
      } @loading (minimum 200ms) {
        <div class="chart-spinner">Loading chart module chunks...</div>
      } @error {
        <div class="chart-error">Failed to stream telemetry widget</div>
      }
    </section>
  `
})
export class DeferrableAnalyticsWidgetComponent {
  readonly transactionsPerSec = signal<number>(4500);
  readonly memoryMb = signal<number>(184);
}
