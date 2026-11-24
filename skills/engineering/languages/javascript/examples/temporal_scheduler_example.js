export class EventScheduler {
  #timeZone;

  constructor(timeZone = 'Asia/Seoul') {
    this.#timeZone = timeZone;
  }

  createDailySchedule(startDateString, daysCount, targetHour = 9) {
    const start = Temporal.PlainDate.from(startDateString);
    const schedule = [];

    for (let i = 0; i < daysCount; i++) {
      const currentDate = start.add({ days: i });
      const plainTime = Temporal.PlainTime.from({ hour: targetHour, minute: 0 });
      const zonedDateTime = currentDate.toZonedDateTime({
        plainTime: plainTime,
        timeZone: this.#timeZone
      });

      schedule.push({
        date: currentDate.toString(),
        isoString: zonedDateTime.toString(),
        epochMilliseconds: zonedDateTime.epochMilliseconds
      });
    }

    return schedule;
  }

  isUpcoming(eventIsoString, thresholdHours = 24) {
    const eventTime = Temporal.ZonedDateTime.from(eventIsoString);
    const now = Temporal.Now.zonedDateTimeISO(this.#timeZone);
    const remaining = now.until(eventTime);
    const hours = remaining.total({ unit: 'hour' });

    return hours >= 0 && hours <= thresholdHours;
  }
}
