export enum City {
  HighCost = "high",
  LowCost = "low",
}

export type ProjectPojo = {
  city: City;
  startDate: string;
  endDate: string;
}

export type ProjectSetPojo = ProjectPojo[];
