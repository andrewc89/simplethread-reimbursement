export enum ReimbursementRate {
  None = 0,
  Low = 1,
  High = 2,
}

enum ReimbursementType {
  FullDay = 0,
  TravelDay = 1,
}

// all js arrays are unique so unable to use a tuple as a map key. opted to
// stringify the tuple and wrap in the Charge class
const reimbursementMap: Map<string, number> = new Map([
  [[ReimbursementRate.High, ReimbursementType.FullDay].toString(), 85],
  [[ReimbursementRate.High, ReimbursementType.TravelDay].toString(), 55],
  [[ReimbursementRate.Low, ReimbursementType.FullDay].toString(), 75],
  [[ReimbursementRate.Low, ReimbursementType.TravelDay].toString(), 45],
]);

class Reimbursement {
  constructor(
    private readonly rate: ReimbursementRate,
    private readonly type: ReimbursementType,
  ) {}

  amount(): number {
    return reimbursementMap.get([this.rate, this.type].toString());
  }
}

export class ReimbursementPeriod {
  constructor(private readonly rates: ReimbursementRate[]) {}

  push(num: number, type: ReimbursementRate): ReimbursementPeriod {
    return new ReimbursementPeriod(this.rates.concat(Array(num).fill(type)));
  }

  amount(): number {
    return this.rates.reduce((
      reimbursement: number,
      rate: ReimbursementRate,
      index: number,
    ) => {
      // if the first or last day of the period
      if ([0, this.rates.length - 1].includes(index)) {
        return reimbursement + new Reimbursement(
          rate,
          ReimbursementType.TravelDay,
        ).amount();
      }

      if (rate === ReimbursementRate.None) {
        return reimbursement;
      }

      const prevDay = this.rates[index - 1];
      const nextDay = this.rates[index + 1];
      if ([prevDay, nextDay].includes(ReimbursementRate.None)) {
        return reimbursement + new Reimbursement(
          rate,
          ReimbursementType.TravelDay,
        ).amount();
      }

      return reimbursement + new Reimbursement(
        rate,
        ReimbursementType.FullDay,
      ).amount();
    }, 0);
  }
}
