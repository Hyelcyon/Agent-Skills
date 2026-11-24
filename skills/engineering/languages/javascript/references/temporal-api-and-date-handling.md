# JavaScript Temporal API and Deterministic Date Architecture

Engineering guidelines for replacing legacy JavaScript Date with the modern ECMAScript Temporal API, ensuring immutable, timezone-aware datetime calculations.

## 1. Why Legacy Date Is Deprecated

The built-in `Date` object exhibits severe historical defects:
1. **Mutability**: Modifying a date via `date.setHours()` mutates the existing instance in-place, causing unexpected side effects across shared references.
2. **Missing Timezone Awareness**: `Date` internally tracks only UTC timestamps and formats according to the host system's local timezone. It cannot represent arbitrary timezones without manual offset arithmetic.
3. **Inconsistent Indexing**: Months are zero-indexed (0 is January), while days of the month are one-indexed (1 to 31).
4. **Silent Rollover Bugs**: Setting day 32 on a month silently rolls over into the next month instead of rejecting invalid input.

---

## 2. Temporal API Type System

The `Temporal` namespace partitions datetime handling into distinct, immutable domain primitives:

- **`Temporal.Instant`**: A fixed, unambiguous point in universal time, measured in nanoseconds since the Unix epoch.
- **`Temporal.ZonedDateTime`**: An exact point in time associated with a specific timezone and calendar system (e.g. `Asia/Seoul`).
- **`Temporal.PlainDate`**: A calendar date without time or timezone components (e.g. `2026-11-03`).
- **`Temporal.PlainTime`**: A wall-clock time without a date or timezone component (e.g. `14:30:00`).
- **`Temporal.Duration`**: A measurable length of time (e.g. 2 hours and 30 minutes).

> **Runtime Availability**: Temporal reached TC39 Stage 4 (ECMAScript 2026). On Node.js 22 LTS, require `@js-temporal/polyfill` (`import { Temporal } from '@js-temporal/polyfill'`) or the `--harmony-temporal` flag. On Node.js 26+ and modern evergreen browsers, it is available globally without flags.

---

## 3. Practical Temporal Operations

### Creating Timezone-Aware Datetimes

```javascript
export function getLocalizedTimestamp(timeZoneId) {
  return Temporal.Now.zonedDateTimeISO(timeZoneId);
}

export function scheduleFutureEvent(startDateTime, daysToAdd) {
  const duration = Temporal.Duration.from({ days: daysToAdd });
  return startDateTime.add(duration);
}
```

### Deterministic Date Arithmetic

Temporal calculations reject invalid values and handle leap years, daylight saving time (DST) shifts, and variable month lengths deterministically:

```javascript
const initialDate = Temporal.PlainDate.from('2026-01-31');
const nextMonth = initialDate.add({ months: 1 });
```

Adding one month to January 31st yields February 28th (or 29th on leap years) rather than rolling over into March.

---

## 4. Sorting and Comparing Dates

Temporal objects provide dedicated static comparison functions:

```javascript
const appointments = [
  Temporal.PlainDate.from('2026-12-15'),
  Temporal.PlainDate.from('2026-04-10'),
  Temporal.PlainDate.from('2026-08-22')
];

const sortedAppointments = appointments.toSorted(Temporal.PlainDate.compare);
```

Using `Temporal.PlainDate.compare` eliminates error-prone string conversion or timestamp millisecond parsing during sorting operations.
