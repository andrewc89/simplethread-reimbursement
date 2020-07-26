import { ProjectSetPojo, City } from "./types";
import { Project } from "./project";
import { ReimbursementPeriod, ReimbursementRate } from "./reimbursementPeriod";

const cityCostMap: Map<City, ReimbursementRate> = new Map([
  [City.HighCost, ReimbursementRate.High],
  [City.LowCost, ReimbursementRate.Low],
]);

export class ProjectSet {
  constructor (private readonly set: Project[]) {}

  public static fromPojo(setPojo: ProjectSetPojo): ProjectSet {
    return new ProjectSet(
      setPojo.map(projectPojo => new Project(projectPojo)),
    );
  }

  reimbursement(): ReimbursementPeriod {
    return this.set.reduce((
      period: ReimbursementPeriod,
      project: Project,
      index: number,
    ) => {
      const cost = cityCostMap.get(project.city);
      const days = project.days();
      if (index === 0) {
        return period.push(days, cost);
      }

      const prevProject = this.set[index - 1];
      const leadingGapDays = project.leadingGapDays(prevProject);
      if (leadingGapDays > 0) {
        return period.push(leadingGapDays, ReimbursementRate.None).push(days, cost);
      }

      if (project.isAbuttingEndOf(prevProject)) {
        return period.push(days - 1, cost);
      }

      return period.push(days - project.overlappingDays(prevProject), cost);
    }, new ReimbursementPeriod([]));
  }
}
