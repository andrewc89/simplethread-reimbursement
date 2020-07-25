import { DateTime, Interval } from "luxon";
import { ProjectSetPojo, ProjectPojo, City } from "./types";

const dateFormat = "M/d/yy";

enum Day {
  GapDay = 0,
  LowCostProjectDay = 1,
  HighCostProjectDay = 2,
}

const cityDayMap: Map<City, Day> = new Map([
  [City.HighCost, Day.HighCostProjectDay],
  [City.LowCost, Day.LowCostProjectDay]
]);

enum Charge {
  FullDay = 0,
  TravelDay = 1,
}

const reimbursementMap: Map<string, number> = new Map([
  [[Day.HighCostProjectDay, Charge.FullDay].toString(), 85],
  [[Day.HighCostProjectDay, Charge.TravelDay].toString(), 55],
  [[Day.LowCostProjectDay, Charge.FullDay].toString(), 75],
  [[Day.LowCostProjectDay, Charge.TravelDay].toString(), 45],
]);

class ProjectDay {
  constructor(
    private readonly day: Day,
    private readonly charge: Charge,
  ) {}

  reimbursement(): number {
    return reimbursementMap.get([this.day, this.charge].toString());
  }
}

export class ProjectSet {
  constructor (private readonly set: Project[]) {}

  reimbursement(): number {
    const days = this.days();
    return days.reduce((
      reimbursement: number,
      day: Day,
      index: number,
    ) => {
      if ([0, days.length - 1].includes(index)) {
        return reimbursement + new ProjectDay(day, Charge.TravelDay).reimbursement();
      }

      if (day === Day.GapDay) {
        return reimbursement;
      }

      const prevDay = days[index - 1];
      const nextDay = days[index + 1];
      if ([prevDay, nextDay].includes(Day.GapDay)) {
        return reimbursement + new ProjectDay(day, Charge.TravelDay).reimbursement();
      }

      return reimbursement + new ProjectDay(day, Charge.FullDay).reimbursement();
    }, 0);
  }

  days(): Array<Day> {
    return this.set.reduce((
      days: Array<Day>,
      project: Project,
      index: number,
    ) => {
      const interval = project.interval()
      const city = project.city();
      if (index === 0) {
        return days.concat(Array(interval.count("days")).fill(cityDayMap.get(city)));
      }

      const prevProject = this.set[index - 1];
      const prevInterval = prevProject.interval();
      const gapInterval = Interval.fromDateTimes(
        prevInterval.end,
        interval.start,
      );
      if (gapInterval.isValid) {
        const precedingGapDays = Math.max(0, gapInterval.length("days") - 1);
        const precedingGapDaysArray = Array(precedingGapDays).fill(Day.GapDay);
        days = days.concat(precedingGapDaysArray);
      }

      if (interval.overlaps(prevInterval)) {
        const intersection = interval.intersection(prevInterval);
        const overlappingDays =intersection.count("days");
        days = days.slice(0, days.length - overlappingDays);
      }

      if (prevInterval.abutsStart(interval)) {
        days = days.slice(0, days.length - 1);
      }

      const projectDays = interval.count("days");
      const projectDaysArray = Array(projectDays).fill(cityDayMap.get(city));
      return days.concat(projectDaysArray);
    }, []);
  }

  public static fromPojo(setPojo: ProjectSetPojo): ProjectSet {
    return new ProjectSet(
      setPojo.map(projectPojo => new Project(projectPojo)),
    );
  }
}

export class Project {
  constructor(private readonly pojo: ProjectPojo) {}

  city(): City {
    return this.pojo.city;
  }

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
