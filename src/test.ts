import { DateTime, Interval } from "luxon";
import assert from "assert";

const intervals = [
  Interval.fromDateTimes(
    DateTime.fromFormat("9/1/15", "M/d/yy"),
    DateTime.fromFormat("9/3/15", "M/d/yy"),
  ),
  Interval.fromDateTimes(
    DateTime.fromFormat("9/3/15", "M/d/yy"),
    DateTime.fromFormat("9/7/15", "M/d/yy"),
  ),
  Interval.fromDateTimes(
    DateTime.fromFormat("9/7/15", "M/d/yy"),
    DateTime.fromFormat("9/7/15", "M/d/yy"),
  ),
  Interval.fromDateTimes(
    DateTime.fromFormat("9/10/15", "M/d/yy"),
    DateTime.fromFormat("9/13/15", "M/d/yy"),
  ),
];

const days = intervals.reduce((
  days: Array<0|1>,
  interval: Interval,
  index: number,
) => {
  console.log(JSON.stringify(days));
  console.log(`INDEX: ${index}`);
  if (index === 0) {
    return days.concat(Array(interval.count("days")).fill(1));
  }

  const prevInterval = intervals[index - 1];
  const gapInterval = Interval.fromDateTimes(
    prevInterval.end,
    interval.start,
  );
  if (gapInterval.isValid) {
    const precedingGapDays = Math.max(0, gapInterval.length("days") - 1);
    console.log(`precedingGapDays: ${precedingGapDays}`);
    const precedingGapDaysArray = Array(precedingGapDays).fill(0);
    days = days.concat(precedingGapDaysArray);
  }

  const projectDays = interval.count("days");
  if (interval.overlaps(prevInterval)) {
    const intersection = interval.intersection(prevInterval);
    const overlappingDays =intersection.count("days");
    console.log(`overlappingDays: ${overlappingDays}`);
    days = days.slice(0, days.length - overlappingDays);
  }

  if (prevInterval.abutsStart(interval)) {
    console.log("abuts");
    days = days.slice(0, days.length - 1);
  }

  console.log(`projectDays: ${projectDays}`);
  const projectDaysArray = Array(projectDays).fill(1);
  return days.concat(projectDaysArray);
}, []);

console.log(JSON.stringify(days));
assert.deepEqual(days, [1,1,1,1,1,1,1,0,0,1,1,1,1]);
