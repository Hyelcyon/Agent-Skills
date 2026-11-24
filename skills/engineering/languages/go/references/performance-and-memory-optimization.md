# Go Performance, Memory Optimization, and Value Semantics

Architectural guide for memory management, value vs pointer semantics, zero-value design, and zero-allocation pipelines in Go 1.22+.

---

## 1. Value vs Pointer Semantics (Google & Bill Kennedy Guidelines)

Choose receiver types based on **type semantics and correctness**, not speculative micro-benchmarks.

### Decision Matrix:
| Type Characteristic | Recommended Receiver | Semantics |
| :--- | :--- | :--- |
| **Small primitive types (numbers, coordinates, small structs)** | Value (`T`) | Immutable value semantics; copied safely across function boundaries without escaping to heap. |
| **Types that mutate internal state** | Pointer (`*T`) | Pointer semantics; mutates the caller's instance. |
| **Types containing synchronization primitives (`sync.Mutex`)** | Pointer (`*T`) | Pointer semantics; prevents copying the internal lock state. |
| **Large structs (> 64 bytes) with high call frequency** | Pointer (`*T`) | Avoids continuous stack copying. |
| **Slices, maps, channels, functions** | Value (`T`) | These types already wrap pointer-like descriptor headers; pass by value. |

### The Consistency Rule (Google Style):
If any method on a struct requires a pointer receiver (`*T`), **all methods on that struct should use pointer receivers** to maintain a consistent method set.

---

## 2. Make the Zero Value Useful (Go Proverbs)

Design structs so their default uninitialized state (`var x T`) is immediately operational without requiring mandatory factory constructors:

```go
package buffer

import (
	"bytes"
	"sync"
)

// ✅ IDIOMATIC: Zero value is ready to use immediately
type SafeBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (s *SafeBuffer) Write(p []byte) (n int, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.buf.Write(p)
}

func (s *SafeBuffer) String() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.buf.String()
}
```

---

## 3. Avoiding Interface Boxing and Escape Overhead

Passing concrete types to interface parameters (`any` or wide interfaces) causes the compiler to wrap the value in an interface box, forcing a heap allocation if escape analysis cannot prove stack confinement:

```bash
# Verify compiler allocation and inlining decisions:
go build -gcflags="-m -m" ./...
```

### Guidance:
- Keep interfaces narrow (1-2 methods).
- Return concrete types from packages; accept interfaces at consumer call sites.
- Avoid premature abstractions that box primitive values into heap-allocated wrappers.

---

## 4. Slice and Map Pre-Allocation

Slices that grow incrementally via `append()` reallocate their backing array at exponential boundaries ($2\times$ or $1.25\times$), creating short-lived heap allocations:

```go
// ❌ UNSIZED: Generates multiple garbage arrays as slice expands
var results []User
for _, raw := range rawUsers {
    results = append(results, parse(raw))
}

// ✅ PRE-ALLOCATED: Exactly 1 heap allocation of exact size
results := make([]User, 0, len(rawUsers))
for _, raw := range rawUsers {
    results = append(results, parse(raw))
}

// ✅ MAP SIZING: Sizing hint prevents hash table bucket rehashing
cache := make(map[string]User, len(rawUsers))
```

---

## 5. High-Throughput Object Reuse with `sync.Pool`

For high-frequency I/O serialization, allocate reusable buffers using `sync.Pool` to minimize GC pressure:

```go
package pool

import (
	"bytes"
	"sync"
)

var bufferPool = sync.Pool{
	New: func() any {
		return new(bytes.Buffer)
	},
}

func FormatLog(msg string) []byte {
	buf := bufferPool.Get().(*bytes.Buffer)
	buf.Reset() // Crucial: clear previous content
	defer bufferPool.Put(buf)

	buf.WriteString("LOG: ")
	buf.WriteString(msg)

	// Return an isolated copy if retained beyond function lifetime
	out := make([]byte, buf.Len())
	copy(out, buf.Bytes())
	return out
}
```

---

## 6. Go 1.23+ Range-Over-Func Iterators

In **Go 1.23+**, custom collection traversal can be performed with zero heap allocations using standard iterators (`iter.Seq` and `iter.Seq2`):

```go
package iterator

import "iter"

type Tree[T any] struct {
	values []T
}

// Elements yields an iterator that can be looped over with 'for v := range tree.Elements()'
func (t *Tree[T]) Elements() iter.Seq[T] {
	return func(yield func(T) bool) {
		for _, val := range t.values {
			if !yield(val) {
				return
			}
		}
	}
}
```
Range-over-func avoids materializing intermediate slices or channels for sequence traversals.
