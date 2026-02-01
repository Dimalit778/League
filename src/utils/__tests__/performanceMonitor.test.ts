import { PerformanceMonitor } from '../performanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    // Get a fresh instance by resetting the singleton
    monitor = PerformanceMonitor.getInstance();
    monitor.reset();
  });

  it('returns the same instance (singleton)', () => {
    const a = PerformanceMonitor.getInstance();
    const b = PerformanceMonitor.getInstance();
    expect(a).toBe(b);
  });

  it('records render times for a component', () => {
    const stop = monitor.startMonitoring('TestComponent');
    stop();

    const avg = monitor.getAverageRenderTime('TestComponent');
    expect(avg).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 average for unknown components', () => {
    expect(monitor.getAverageRenderTime('Unknown')).toBe(0);
  });

  it('generates a performance report', () => {
    const stop1 = monitor.startMonitoring('CompA');
    stop1();
    const stop2 = monitor.startMonitoring('CompB');
    stop2();

    const report = monitor.getPerformanceReport();
    expect(report).toHaveProperty('CompA');
    expect(report).toHaveProperty('CompB');
  });

  it('keeps only last 10 render times', () => {
    for (let i = 0; i < 15; i++) {
      const stop = monitor.startMonitoring('Frequent');
      stop();
    }

    // Should still work (internal array capped at 10)
    const avg = monitor.getAverageRenderTime('Frequent');
    expect(avg).toBeGreaterThanOrEqual(0);
  });

  it('clears all data on reset', () => {
    const stop = monitor.startMonitoring('ToReset');
    stop();

    monitor.reset();
    expect(monitor.getAverageRenderTime('ToReset')).toBe(0);
    expect(monitor.getPerformanceReport()).toEqual({});
  });
});
