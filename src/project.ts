import { DateTime, Interval } from "luxon";
import { ProjectPojo, City } from "./types";

const dateFormat = "M/d/yy";

export class Project {
  public readonly interval: Interval;
  public readonly city: City;

  constructor(pojo: ProjectPojo) {
    this.interval = Interval.fromDateTimes(
      DateTime.fromFormat(pojo.startDate, dateFormat),
      DateTime.fromFormat(pojo.endDate, dateFormat),
    );
    this.city = pojo.city;
  }

  days(): number {
    return this.interval.count("days");
  }

  // the number of days following the end of the specified project and before
  // the start of this project
  leadingGapDays(prevProject: Project): number {
    const gapInterval = Interval.fromDateTimes(
      prevProject.interval.end,
      this.interval.start,
    );

    return Math.max(0, gapInterval.length("days") - 1);
  }

  overlappingDays(prevProject: Project): number {
    if (!this.interval.overlaps(prevProject.interval)) {
      return 0;
    }

    const intersection = this.interval.intersection(prevProject.interval);
    return intersection.count("days");
  }

  // is the start of this project abutting the end of the specified project?
  isAbuttingEndOf(prevProject: Project): boolean {
    return prevProject.interval.abutsStart(this.interval);
  }
}
