# 01 — java.time

Dates are the classic place where a program is right on a developer's laptop and
wrong in production. `java.time` is unusually well designed — its whole value is
that it forces you to say which *kind* of time you mean.

## Five types, and how to pick

```java
Instant        i = Instant.now();                    // 2024-06-15T22:30:00Z
LocalDate      d = LocalDate.of(2024, 6, 15);        // 2024-06-15
LocalDateTime  l = LocalDateTime.of(2024, 6, 15, 18, 30);
OffsetDateTime o = OffsetDateTime.parse("2024-06-15T18:30-04:00");
ZonedDateTime  z = l.atZone(ZoneId.of("America/New_York"));
```

- **`Instant`** — a point on the universal timeline, nanoseconds since the epoch.
  No zone, no calendar. Use it for *when something happened*: timestamps, log
  lines, expiry, anything you store in a database.
- **`LocalDate` / `LocalTime` / `LocalDateTime`** — a calendar reading with **no
  zone at all**. `2024-06-15T18:30` is not a moment; it is a moment in 38
  different places. Use it for birthdays, opening hours, contract dates.
- **`OffsetDateTime`** — a local reading plus a fixed offset (`-04:00`). Enough
  to pin an instant, not enough to do calendar arithmetic, because an offset is
  not a rulebook.
- **`ZonedDateTime`** — a local reading plus a `ZoneId` (`America/New_York`),
  which *is* the rulebook: it knows when the offset changes. Use it whenever you
  need "9am next Tuesday, wherever that user lives".

The one-line rule: **store `Instant`, display `ZonedDateTime`, model calendars
with `LocalDate`.**

Every type is immutable. `date.plusDays(1)` returns a new object and leaves
`date` alone — the same shape as `String.toUpperCase`, and the same trap if you
forget to assign the result.

## Duration is not Period

```java
Duration.ofDays(1)   // exactly 86_400 seconds — a machine quantity
Period.ofDays(1)     // "the next day on a calendar" — a human quantity
```

`Duration` measures elapsed time in seconds and nanos. `Period` measures years,
months and days and does not know how long a day is. `Period.between(a, b)`
across a month boundary gives `P1M1D`, not a number of days, because months are
not all the same length. `ChronoUnit.DAYS.between(a, b)` gives you a count
instead — and it **truncates toward zero**, so 23 hours apart is `0` days.

## Time zones will hurt you twice a year

Clocks jump forward in spring, so some local times **never happen**. They jump
back in autumn, so some local times **happen twice**.

```java
ZoneId ny = ZoneId.of("America/New_York");
LocalDateTime gap = LocalDateTime.of(2024, 3, 10, 2, 30);   // does not exist
ny.getRules().getValidOffsets(gap);   // []
gap.atZone(ny);                       // 2024-03-10T03:30-04:00 — silently moved

LocalDateTime dup = LocalDateTime.of(2024, 11, 3, 1, 30);   // happens twice
ny.getRules().getValidOffsets(dup);   // [-04:00, -05:00]
dup.atZone(ny);                       // picks -04:00, the EARLIER one
dup.atZone(ny).withLaterOffsetAtOverlap();   // the other 01:30
```

`atZone` never throws. It silently pushes a gap time forward by the size of the
gap, and silently picks the first of an overlap. That is the right default for a
UI and the wrong default for a billing run. `getValidOffsets` is how you find
out which case you are in before deciding.

## The trap: `plusDays(1)` is not `plus(Duration.ofDays(1))`

```java
ZonedDateTime start = LocalDateTime.of(2024, 3, 9, 12, 0).atZone(ny);

start.plusDays(1);                 // 2024-03-10T12:00-04:00 — 23 hours later
start.plus(Duration.ofDays(1));    // 2024-03-10T13:00-04:00 — 24 hours later
```

Both are correct; they answer different questions. `plusDays` is calendar
arithmetic — *same wall-clock time tomorrow* — and on a spring-forward day only
23 hours elapse. `plus(Duration.ofDays(1))` is elapsed-time arithmetic — *24
hours from now* — and the wall clock lands an hour later than you expected.

"Remind me at noon tomorrow" wants the first. "The token expires in 24 hours"
wants the second. Picking the wrong one produces a bug that appears twice a year
and is unreproducible in a unit test that runs in July.

Two smaller versions of the same trap:

```java
LocalDate.of(2024, 1, 31).plusMonths(1);                  // 2024-02-29, clamped
LocalDate.of(2024, 1, 31).plusMonths(1).plusMonths(1);    // 2024-03-29
LocalDate.of(2024, 1, 31).plusMonths(2);                  // 2024-03-31
```

Adding months clamps to the end of the month, so it is not associative.

## Formatting: `DateTimeFormatter` is immutable, and `YYYY` is a lie

```java
DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
f.format(LocalDate.of(2019, 12, 30));                     // 2019-12-30
DateTimeFormatter.ofPattern("YYYY-MM-dd").format(...);    // 2020-12-30
```

`y` is the calendar year; `Y` is the **week-based year**, which rolls over when
the ISO week does. 30 December 2019 falls in the first ISO week of 2020, so
`YYYY` prints 2020. The same family of traps: `D` is day-of-*year*, `d` is
day-of-month; `mm` is minutes, `MM` is months; `hh` is the 12-hour clock, `HH`
the 24-hour one.

`DateTimeFormatter` is immutable and **thread-safe**, so one static instance can
be shared by every thread in the process. That was the single biggest reason to
replace the old API: `SimpleDateFormat` keeps parse state in a mutable field, so
sharing one between threads silently corrupts output — a bug that only appears
under load. `withLocale` and friends return a new formatter rather than mutating
this one, which is what makes the sharing safe.

## Testing time: inject a `Clock`

```java
Clock clock = Clock.fixed(Instant.parse("2024-06-15T22:30:00Z"), ZoneOffset.UTC);
LocalDate.now(clock);     // always 2024-06-15
Instant.now(clock);       // always the same instant
```

Every `now()` in `java.time` has a `now(Clock)` overload. Code that calls the
no-argument version cannot be tested at a month boundary, at midnight, or on a
leap day. Take a `Clock` as a constructor parameter and pass
`Clock.systemDefaultZone()` in production — the same move as injecting a
random-number source.

Note that a `Clock` carries a zone as well as an instant, which is why
`LocalDate.now(clock)` can answer two different dates for one instant.

## What to build

| Method | What it does |
| --- | --- |
| `today(Clock)` | The date according to an injected clock |
| `offsetsFor(LocalDateTime, ZoneId)` | 0, 1 or 2 valid offsets — gap, normal, overlap |
| `resolve(LocalDateTime, ZoneId)` | What `atZone` actually does with a gap |
| `addOneDay(ZonedDateTime, boolean)` | Calendar day vs 24 hours |
| `calendarBetween(LocalDate, LocalDate)` | A `Period`, not a day count |
| `wholeDaysBetween(LocalDateTime, LocalDateTime)` | A day count, truncated |
| `format(TemporalAccessor, String)` | Pattern formatting, `YYYY` included |
| `sameInstant(String, String)` | Two ISO strings, one moment |
| `formatConcurrently(List, String)` | One shared formatter, many threads |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `resolve` moves a non-existent local time forward. What would you have to
   write instead if a scheduling system had to *reject* it? What should a
   payroll system do with an hour that happens twice?
2. `Duration.between(a, b)` on two `LocalDateTime`s compiles. Should it? What
   does it assume, and when is that assumption wrong?
3. `Instant` has no `getYear()`. Work out why that is a feature and not an
   omission, then work out what you must supply to get one.
4. tzdb changes — governments move DST rules with a few weeks' notice. If you
   stored a future appointment as an `Instant`, what happens when the rule
   changes? What if you stored it as `LocalDateTime` plus a `ZoneId`?
