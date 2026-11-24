# Go Error Handling and Structured Observability Architecture

Senior error architecture based on **Google GoTip #1 (Line of Sight)**, the **Uber Go Style Guide**, and **Go CodeReviewComments**.

---

## 1. Line of Sight (Google GoTip #1)

Code should maintain a straight visual "line of sight" down the left margin. Avoid deep nesting and `else` branches by handling guards and errors early.

```go
// ❌ WRONG: Deep nesting and rightward drift
func ProcessItem(item *Item) error {
    if item != nil {
        if item.IsValid() {
            err := item.Save()
            if err == nil {
                return nil
            } else {
                return err
            }
        } else {
            return errors.New("invalid item")
        }
    } else {
        return errors.New("item is nil")
    }
}

// ✅ IDIOMATIC: Clear Line of Sight with early guard returns
func ProcessItem(item *Item) error {
    if item == nil {
        return errors.New("item is nil")
    }
    if !item.IsValid() {
        return errors.New("item is invalid")
    }
    if err := item.Save(); err != nil {
        return fmt.Errorf("saving item %s: %w", item.ID, err)
    }
    return nil
}
```

---

## 2. Handle Errors Once (Uber & Cheney Principle)

> *"An error should be handled only once."* — Dave Cheney & Uber Go Style Guide

Logging an error **and** returning it up the stack creates noisy, duplicated log output that obscures the root cause:

```go
// ❌ ANTI-PATTERN: Double handling (logs AND returns)
func FetchUser(id string) (*User, error) {
    u, err := db.GetUser(id)
    if err != nil {
        log.Printf("failed to get user: %v", err) // Logged here
        return nil, err                           // And returned!
    }
    return u, nil
}

// ✅ IDIOMATIC: Wrap with context and bubble up; log once at the entry boundary
func FetchUser(id string) (*User, error) {
    u, err := db.GetUser(id)
    if err != nil {
        return nil, fmt.Errorf("fetching user %s: %w", id, err)
    }
    return u, nil
}
```

---

## 3. Formatting Without Error Stutter

When wrapping errors, do not prefix messages with redundant phrases like `"failed to"`, `"error in"`, or `"unable to"`. Because errors are chained upwards, repeating "failed to" results in:
`failed to authenticate: failed to read token: failed to open file`

```go
// ❌ STUTTER: Redundant words
return fmt.Errorf("failed to parse json config: %w", err)

// ✅ CLEAN & CONTEXTUAL: Clean operational descriptor
return fmt.Errorf("parsing json config %s: %w", path, err)
```

### Error String Invariants (Google CodeReviewComments):
- Error strings must never start with a capital letter (unless it begins with an acronym like `UUID` or `URL`).
- Error strings must never end with punctuation (periods, exclamation marks).
```go
// ❌ WRONG: Capitalized with punctuation
return errors.New("Connection timed out.")

// ✅ IDIOMATIC: Lowercase without punctuation
return errors.New("connection timed out")
```

---

## 4. Semantic Error Inspection: `errors.Is` vs `errors.As`

- Use `errors.Is(err, target)` to test for sentinel errors anywhere in the wrapped chain:
```go
if errors.Is(err, os.ErrNotExist) {
    // Handle missing file
}
```

- Use `errors.As(err, &target)` to extract structured custom error types:
```go
var queryErr *sql.QueryError
if errors.As(err, &queryErr) {
    // Access queryErr.Query or queryErr.Code
}
```

---

## 5. Aggregating Errors with `errors.Join` (Go 1.20+)

When collecting multiple validation violations or cleanup errors, use `errors.Join` rather than third-party multierror libraries:

```go
package validator

import (
	"errors"
	"fmt"
)

type UserInput struct {
	Username string
	Age      int
}

func Validate(in UserInput) error {
	var errs []error
	if len(in.Username) < 3 {
		errs = append(errs, errors.New("username must be at least 3 characters"))
	}
	if in.Age < 0 {
		errs = append(errs, fmt.Errorf("invalid age %d: cannot be negative", in.Age))
	}
	return errors.Join(errs...)
}
```

---

## 6. Structured Logging with `log/slog` and Redaction

Use `log/slog` for zero-allocation structured attributes. Implement `slog.LogValuer` on sensitive domain types to prevent secret leakage:

```go
package security

import "log/slog"

type SecretKey string

func (k SecretKey) LogValue() slog.Value {
	return slog.StringValue("[REDACTED]")
}

func LogAccess(logger *slog.Logger, key SecretKey, user string) {
	logger.Info("access attempt",
		slog.Any("key", key), // Outputs [REDACTED]
		slog.String("user", user),
	)
}
```
