import { RRule, RRuleSet, Frequency } from 'rrule';

export const localDateToUtc = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );

export const getRecurringDates = (
  from: Date,
  to: Date,
  frequency: Frequency,
  additionalDates: Date[] = []
): Date[] => {
  const rruleSet = new RRuleSet();

  rruleSet.rrule(
    new RRule({
      dtstart: from,
      until: to,
      freq: frequency
    })
  );

  additionalDates.forEach(dtstart => {
    rruleSet.rrule(
      new RRule({
        dtstart,
        until: to,
        freq: frequency
      })
    );

    rruleSet.rrule(
      new RRule({
        dtstart: new Date(dtstart.getTime() - 1),
        until: to,
        freq: frequency
      })
    );
  });

  rruleSet.rdate(to);

  return rruleSet.all();
};
