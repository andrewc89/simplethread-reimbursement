import { DateTime, Interval } from "luxon";

export enum City {
  HighCost = "high",
  LowCost = "low",
}

const dateFormat = "M/d/yy";

export type ProjectPojo = {
  city: City;
  startDate: string;
  endDate: string;
}

export type ProjectSetPojo = ProjectPojo[];

export class ProjectSet {
  constructor (private readonly set: Project[]) {}

  reimbursement(): void {
    
  }

  days(): void {
    this.set.reduce((
      days: Array<0|1>,
      project: Project,
      index: number,
    ) => {
      const interval = project.interval()
      if (index === 0) {
        return days.concat(Array(Math.max(0, interval.count("days"))).fill(1));
      }

      const prevProject = this.set[index - 1];
      const prevInterval = prevProject.interval();
      const gapInterval = Interval.fromDateTimes(
        prevInterval.end,
        interval.start,
      );
      if (gapInterval.isValid) {
        const precedingGapDays = Math.max(0, gapInterval.length("days") - 1);
        const precedingGapDaysArray = Array(precedingGapDays).fill(0);
        days = days.concat(precedingGapDaysArray);
      }

      const projectDays = interval.count("days");
      if (interval.overlaps(prevInterval)) {
        const intersection = interval.intersection(prevInterval);
        const overlappingDays =intersection.count("days");
        days = days.slice(0, days.length - overlappingDays);
      }

      if (prevInterval.abutsStart(interval)) {
        days = days.slice(0, days.length - 1);
      }

      const projectDaysArray = Array(projectDays).fill(1);
      return days.concat(projectDaysArray);
    }, []);
  }
}

export class Project {
  constructor(private readonly pojo: ProjectPojo) {}

  startDate(): DateTime {
    return DateTime.fromFormat(this.pojo.startDate, dateFormat);
  }

  endDate(): DateTime {
    return DateTime.fromFormat(this.pojo.endDate, dateFormat);
  }

  interval(): Interval {
    return Interval.fromDateTimes(this.startDate(), this.endDate());
  }

  // fullDays(): number {
  //   return Math.max(0, this.interval().count("days") - 2);
  // }
  //
  // travelDays(): number {
  //   return this.interval().count("days") === 1 ? 1 : 2;
  // }

  days(): Array<1> {
    const numOfDays = this.interval().count("days");
    return Array(numOfDays).fill(1);
  }
}
