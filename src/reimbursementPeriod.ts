export enum ChargeRate {
  None = 0,
  Low = 1,
  High = 2,
}

enum ChargeType {
  FullDay = 0,
  TravelDay = 1,
}

// all js arrays are unique so unable to use a tuple as a map key. opted to
// stringify the tuple and wrap in the Charge class
const reimbursementMap: Map<string, number> = new Map([
  [[ChargeRate.High, ChargeType.FullDay].toString(), 85],
  [[ChargeRate.High, ChargeType.TravelDay].toString(), 55],
  [[ChargeRate.Low, ChargeType.FullDay].toString(), 75],
  [[ChargeRate.Low, ChargeType.TravelDay].toString(), 45],
]);

class Charge {
  constructor(
    private readonly rate: ChargeRate,
    private readonly type: ChargeType,
  ) {}

  reimbursement(): number {
    return reimbursementMap.get([this.rate, this.type].toString());
  }
}

export class ReimbursementPeriod {
  constructor(private readonly rates: ChargeRate[]) {}

  push(num: number, type: ChargeRate): ReimbursementPeriod {
    return new ReimbursementPeriod(this.rates.concat(Array(num).fill(type)));
  }

  pop(num: number): ReimbursementPeriod {
    return new ReimbursementPeriod(
      this.rates.slice(0, this.rates.length - num),
    );
  }

  amount(): number {
    return this.rates.reduce((
      reimbursement: number,
      rate: ChargeRate,
      index: number,
    ) => {
      if ([0, this.rates.length - 1].includes(index)) {
        return reimbursement + new Charge(
          rate,
          ChargeType.TravelDay,
        ).reimbursement();
      }

      if (rate === ChargeRate.None) {
        return reimbursement;
      }

      const prevDay = this.rates[index - 1];
      const nextDay = this.rates[index + 1];
      if ([prevDay, nextDay].includes(ChargeRate.None)) {
        return reimbursement + new Charge(
          rate,
          ChargeType.TravelDay,
        ).reimbursement();
      }

      return reimbursement + new Charge(
        rate,
        ChargeType.FullDay,
      ).reimbursement();
    }, 0);
  }
}
