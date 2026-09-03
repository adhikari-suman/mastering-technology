import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static final ZoneId NY = ZoneId.of("America/New_York");
    private static final Instant T = Instant.parse("2024-06-15T02:30:00Z");

    @Test
    @DisplayName("today: one instant is two different dates in two zones")
    void todayDependsOnZone() {
        assertEquals(LocalDate.of(2024, 6, 15), Solution.today(Clock.fixed(T, ZoneOffset.UTC)));
        assertEquals(LocalDate.of(2024, 6, 14), Solution.today(Clock.fixed(T, NY)),
                "02:30 UTC is still the previous evening in New York");
    }

    @Test
    @DisplayName("today: a fixed clock never moves, which is the point")
    void todayIsFixed() {
        Clock clock = Clock.fixed(Instant.parse("2024-02-29T12:00:00Z"), ZoneOffset.UTC);
        assertEquals(Solution.today(clock), Solution.today(clock));
        assertEquals(LocalDate.of(2024, 2, 29), Solution.today(clock), "a leap day you can test on demand");
    }

    @Test
    @DisplayName("offsetsFor: an ordinary local time has exactly one offset")
    void offsetsForNormal() {
        assertEquals(List.of(ZoneOffset.ofHours(-4)),
                Solution.offsetsFor(LocalDateTime.of(2024, 6, 15, 12, 0), NY));
        assertEquals(List.of(ZoneOffset.ofHours(-5)),
                Solution.offsetsFor(LocalDateTime.of(2024, 1, 15, 12, 0), NY), "winter is -05:00");
    }

    @Test
    @DisplayName("offsetsFor: the spring gap has none, the autumn overlap has two")
    void offsetsForTransitions() {
        assertEquals(List.of(),
                Solution.offsetsFor(LocalDateTime.of(2024, 3, 10, 2, 30), NY),
                "02:30 never happened on 10 March 2024 in New York");
        assertEquals(List.of(ZoneOffset.ofHours(-4), ZoneOffset.ofHours(-5)),
                Solution.offsetsFor(LocalDateTime.of(2024, 11, 3, 1, 30), NY),
                "01:30 happened twice, an hour apart");
    }

    @Test
    @DisplayName("resolve: a local time that does not exist is silently moved forward")
    void resolveGap() {
        ZonedDateTime resolved = Solution.resolve(LocalDateTime.of(2024, 3, 10, 2, 30), NY);
        assertEquals(LocalTime.of(3, 30), resolved.toLocalTime(), "pushed forward by the size of the gap");
        assertEquals(ZoneOffset.ofHours(-4), resolved.getOffset());
    }

    @Test
    @DisplayName("resolve: an ambiguous local time picks the earlier offset")
    void resolveOverlap() {
        LocalDateTime dup = LocalDateTime.of(2024, 11, 3, 1, 30);
        ZonedDateTime resolved = Solution.resolve(dup, NY);
        assertEquals(LocalTime.of(1, 30), resolved.toLocalTime());
        assertEquals(ZoneOffset.ofHours(-4), resolved.getOffset(), "the first 01:30, not the second");
        assertEquals(Duration.ofHours(1),
                Duration.between(resolved.toInstant(), resolved.withLaterOffsetAtOverlap().toInstant()),
                "the other reading is an hour later on the timeline");
    }

    @Test
    @DisplayName("resolve: ordinary times are untouched")
    void resolvePlain() {
        LocalDateTime noon = LocalDateTime.of(2024, 6, 15, 12, 0);
        assertEquals(noon, Solution.resolve(noon, NY).toLocalDateTime());
        assertEquals(NY, Solution.resolve(noon, NY).getZone());
    }

    @Test
    @DisplayName("addOneDay: a calendar day across a spring-forward is 23 hours")
    void addOneDayAcrossDst() {
        ZonedDateTime start = LocalDateTime.of(2024, 3, 9, 12, 0).atZone(NY);

        ZonedDateTime calendar = Solution.addOneDay(start, true);
        assertEquals(LocalTime.NOON, calendar.toLocalTime(), "same wall-clock time tomorrow");
        assertEquals(Duration.ofHours(23), Duration.between(start, calendar), "but only 23 hours passed");

        ZonedDateTime elapsed = Solution.addOneDay(start, false);
        assertEquals(LocalTime.of(13, 0), elapsed.toLocalTime(), "24 hours lands an hour later on the clock");
        assertEquals(Duration.ofHours(24), Duration.between(start, elapsed));
    }

    @Test
    @DisplayName("addOneDay: away from a transition the two senses agree")
    void addOneDayOrdinary() {
        ZonedDateTime start = LocalDateTime.of(2024, 6, 15, 12, 0).atZone(NY);
        assertEquals(Solution.addOneDay(start, true), Solution.addOneDay(start, false),
                "which is why choosing the wrong one survives review");
    }

    @Test
    @DisplayName("calendarBetween: months and days, not a day count")
    void calendarBetweenPeriods() {
        assertEquals(Period.of(0, 1, 1),
                Solution.calendarBetween(LocalDate.of(2024, 1, 31), LocalDate.of(2024, 3, 1)));
        assertEquals(Period.ofYears(1),
                Solution.calendarBetween(LocalDate.of(2024, 1, 1), LocalDate.of(2025, 1, 1)));
        assertEquals(Period.ZERO,
                Solution.calendarBetween(LocalDate.of(2024, 6, 15), LocalDate.of(2024, 6, 15)));
        assertTrue(Solution.calendarBetween(LocalDate.of(2024, 3, 1), LocalDate.of(2024, 1, 31)).isNegative(),
                "backwards is negative, not an error");
    }

    @Test
    @DisplayName("wholeDaysBetween: truncates, so 23 hours is zero days")
    void wholeDaysBetweenTruncates() {
        assertEquals(0, Solution.wholeDaysBetween(
                LocalDateTime.of(2024, 1, 1, 23, 0), LocalDateTime.of(2024, 1, 2, 22, 0)),
                "a human calls this 'the next day'; ChronoUnit calls it zero");
        assertEquals(1, Solution.wholeDaysBetween(
                LocalDateTime.of(2024, 1, 1, 23, 0), LocalDateTime.of(2024, 1, 3, 0, 0)));
        assertEquals(-1, Solution.wholeDaysBetween(
                LocalDateTime.of(2024, 1, 3, 0, 0), LocalDateTime.of(2024, 1, 1, 23, 0)));
        assertEquals(0, Solution.wholeDaysBetween(
                LocalDateTime.of(2024, 1, 1, 0, 0), LocalDateTime.of(2024, 1, 1, 0, 0)));
    }

    @Test
    @DisplayName("format: yyyy is the calendar year, YYYY is the week-based year")
    void formatYearPatterns() {
        LocalDate newYearsEve = LocalDate.of(2019, 12, 30);
        assertEquals("2019-12-30", Solution.format(newYearsEve, "yyyy-MM-dd"));
        assertEquals("2020-12-30", Solution.format(newYearsEve, "YYYY-MM-dd"),
                "30 Dec 2019 is in ISO week 1 of 2020");
        assertEquals("2019-364", Solution.format(newYearsEve, "yyyy-DD"), "D is day-of-year");
    }

    @Test
    @DisplayName("format: hh and HH are different clocks, and a bad pattern throws")
    void formatClockPatterns() {
        assertEquals("13:05", Solution.format(LocalTime.of(13, 5), "HH:mm"));
        assertEquals("01:05", Solution.format(LocalTime.of(13, 5), "hh:mm"), "12-hour, and no am/pm marker");
        assertThrows(RuntimeException.class, () -> Solution.format(LocalDate.of(2024, 1, 1), "HH:mm"),
                "a LocalDate has no hour to print");
    }

    @Test
    @DisplayName("sameInstant: different offsets, one moment")
    void sameInstantCompares() {
        assertTrue(Solution.sameInstant("2024-06-15T18:30:00-04:00", "2024-06-15T22:30:00Z"));
        assertFalse(Solution.sameInstant("2024-06-15T18:30:00-04:00", "2024-06-15T18:30:00Z"));
        assertTrue(Solution.sameInstant("2024-06-15T22:30:00Z", "2024-06-15T22:30:00Z"));
        assertNotEquals(OffsetDateTime.parse("2024-06-15T18:30:00-04:00"),
                OffsetDateTime.parse("2024-06-15T22:30:00Z"),
                "equals() on OffsetDateTime also compares the offset — isEqual() does not");
    }

    @Test
    @DisplayName("formatConcurrently: one immutable formatter, many threads, ordered results")
    void formatConcurrentlyIsSafe() {
        List<LocalDate> dates = IntStream.rangeClosed(1, 200)
                .mapToObj(i -> LocalDate.of(2024, 1, 1).plusDays(i))
                .toList();
        List<String> formatted = Solution.formatConcurrently(dates, "yyyy-MM-dd");

        assertEquals(dates.size(), formatted.size());
        assertEquals("2024-01-02", formatted.get(0), "input order is preserved");
        assertEquals("2024-07-19", formatted.get(199));
        for (int i = 0; i < dates.size(); i++) {
            assertEquals(dates.get(i).toString(), formatted.get(i));
        }
        assertEquals(List.of(), Solution.formatConcurrently(List.of(), "yyyy"));
    }
}
