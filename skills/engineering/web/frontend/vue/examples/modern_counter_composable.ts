import { ref, computed, toValue, type MaybeRefOrGetter } from 'vue';

interface UseCounterOptions {
  initialValue?: number;
  step?: MaybeRefOrGetter<number>;
  min?: number;
  max?: number;
}

interface CounterController {
  count: import('vue').Ref<number>;
  isAtMax: import('vue').ComputedRef<boolean>;
  isAtMin: import('vue').ComputedRef<boolean>;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(options: UseCounterOptions = {}): CounterController {
  const initial = options.initialValue ?? 0;
  const count = ref(initial);

  const isAtMax = computed(() => {
    if (options.max === undefined) {
      return false;
    }
    return count.value >= options.max;
  });

  const isAtMin = computed(() => {
    if (options.min === undefined) {
      return false;
    }
    return count.value <= options.min;
  });

  const increment = () => {
    const currentStep = options.step ? toValue(options.step) : 1;
    if (options.max !== undefined && count.value + currentStep > options.max) {
      count.value = options.max;
      return;
    }
    count.value += currentStep;
  };

  const decrement = () => {
    const currentStep = options.step ? toValue(options.step) : 1;
    if (options.min !== undefined && count.value - currentStep < options.min) {
      count.value = options.min;
      return;
    }
    count.value -= currentStep;
  };

  const reset = () => {
    count.value = initial;
  };

  return {
    count,
    isAtMax,
    isAtMin,
    increment,
    decrement,
    reset
  };
}

export { useCounter };
export type { UseCounterOptions, CounterController };
