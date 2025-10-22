// Performance monitoring utilities for list optimization
import { InteractionManager } from 'react-native';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private renderTimes: Map<string, number[]> = new Map();
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (!this.renderTimes.has(componentName)) {
        this.renderTimes.set(componentName, []);
      }

      const times = this.renderTimes.get(componentName)!;
      times.push(renderTime);

      // Keep only last 10 render times
      if (times.length > 10) {
        times.shift();
      }

      // Log slow renders
      if (renderTime > 16) {
        // 60fps threshold
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }

  getAverageRenderTime(componentName: string): number {
    const times = this.renderTimes.get(componentName);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getPerformanceReport(): Record<string, number> {
    const report: Record<string, number> = {};

    for (const [componentName, times] of this.renderTimes.entries()) {
      report[componentName] = this.getAverageRenderTime(componentName);
    }

    return report;
  }

  reset(): void {
    this.renderTimes.clear();
  }
}

// Hook for monitoring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startRender: () => monitor.startMonitoring(componentName),
    getAverageTime: () => monitor.getAverageRenderTime(componentName),
    getReport: () => monitor.getPerformanceReport(),
  };
};

// Utility to defer heavy operations
export const deferHeavyOperation = (operation: () => void) => {
  InteractionManager.runAfterInteractions(() => {
    operation();
  });
};

// Utility to batch operations
export const batchOperations = (operations: (() => void)[]) => {
  InteractionManager.runAfterInteractions(() => {
    operations.forEach((operation) => operation());
  });
};

// Memory usage monitoring
export const logMemoryUsage = () => {
  if (__DEV__) {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      console.log('Memory Usage:', {
        used: `${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }
};
