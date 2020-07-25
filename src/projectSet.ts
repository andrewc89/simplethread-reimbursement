import { ProjectSetPojo, City } from "./types";
import { Project } from "./project";
import { ReimbursementPeriod, ChargeRate } from "./reimbursementPeriod";

const cityCostMap: Map<City, ChargeRate> = new Map([
  [City.HighCost, ChargeRate.High],
  [City.LowCost, ChargeRate.Low]
]);

export class ProjectSet {
  constructor (private readonly set: Project[]) {}

  reimbursement(): ReimbursementPeriod {
    return this.set.reduce((
      period: ReimbursementPeriod,
      project: Project,
      index: number,
    ) => {
      const cost = cityCostMap.get(project.city);
      if (index === 0) {
        return period.push(project.days(), cost);
      }

      const prevProject = this.set[index - 1];
      period = period.push(
        project.leadingGapDays(prevProject),
        ChargeRate.None,
      );
      period = period.pop(project.overlappingDays(prevProject));

      if (project.isAbuttingEndOf(prevProject)) {
        period = period.pop(1);
      }

      return period.push(project.days(), cost);
    }, new ReimbursementPeriod([]));
  }

  public static fromPojo(setPojo: ProjectSetPojo): ProjectSet {
    return new ProjectSet(
      setPojo.map(projectPojo => new Project(projectPojo)),
    );
  }
}
