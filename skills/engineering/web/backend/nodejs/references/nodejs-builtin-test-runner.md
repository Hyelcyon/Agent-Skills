# Node.js Built-in Test Runner (`node:test`)

Technical standards for authoring unit, integration, and mocking test suites using the Node.js built-in test runner.

---

## 1. Zero-Dependency Testing Architecture

Node.js includes a native test runner in `node:test` paired with `node:assert`:
- Zero npm dependencies: Eliminates Jest, Mocha, or Vitest configuration bloat.
- Fast startup: Runs directly on V8 without intermediary compilation pipelines.
- Native code coverage reporting: Built-in lcov and text summaries.

---

## 2. Test Suite Authoring Standard

Author structured test suites using `describe` and `it`/`test`:

```typescript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Calculator Operations', () => {
  let initialBalance: number;

  beforeEach(() => {
    initialBalance = 100;
  });

  it('calculates credit correctly', () => {
    const next = initialBalance + 50;
    assert.strictEqual(next, 150);
  });

  it('rejects overdraft transactions asynchronously', async () => {
    const withdraw = async (amount: number) => {
      if (amount > initialBalance) {
        throw new Error('Insufficient funds');
      }
      return initialBalance - amount;
    };

    await assert.rejects(
      async () => {
        await withdraw(200);
      },
      {
        name: 'Error',
        message: 'Insufficient funds'
      }
    );
  });
});
```

---

## 3. Built-in Mocking and Spies

Use `t.mock` for function spies, method mocks, and timers without external mocking libraries:

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('spies on service dispatch method', (t) => {
  const dispatcher = {
    send: (payload: { id: string }) => payload.id
  };

  const sendMock = t.mock.method(dispatcher, 'send');

  dispatcher.send({ id: 'msg_99' });

  assert.strictEqual(sendMock.mock.callCount(), 1);
  assert.deepStrictEqual(sendMock.mock.calls[0].arguments, [{ id: 'msg_99' }]);
});
```

---

## 4. Test Execution and Coverage CLI

Execute tests across the codebase matching `*.test.ts` or `*.spec.ts`:

```bash
node --test --experimental-strip-types "tests/**/*.test.ts"
```

Generate test coverage reports:
```bash
node --test --experimental-test-coverage --test-reporter=spec "tests/**/*.test.ts"
```
