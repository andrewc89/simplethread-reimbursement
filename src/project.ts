import { DateTime, Interval } from "luxon";
import { ProjectPojo, City } from "./types";

const dateFormat = "M/d/yy";

export class Project {
  public readonly interval: Interval;
  public readonly city: City;
  constructor(private readonly pojo: ProjectPojo) {
    this.interval = Interval.fromDateTimes(
      DateTime.fromFormat(pojo.startDate, dateFormat),
      DateTime.fromFormat(pojo.startDate, dateFormat),
    );
    this.city = pojo.city;
  }

  days(): number {
    return this.interval.count("days");
  }

  leadingGapDays(project: Project): number {
    const gapInterval = Interval.fromDateTimes(
      project.interval.end,
      this.interval.start,
    );
    // TODO: Remove if and rely on Math.max?
    if (gapInterval.isValid) {
      return 0;
    }

    return Math.max(0, gapInterval.length("days") - 1);
  }

  overlappingDays(project: Project): number {
    if (!this.interval.overlaps(project.interval)) {
      return 0;
    }

    const intersection = this.interval.intersection(project.interval);
    return intersection.count("days");
  }

  // if this project is abutting the end of the specified project
  isAbuttingEndOf(project: Project): boolean {
    return project.interval.abutsStart(this.interval);
  }
}
