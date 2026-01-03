export interface Competition {
  id: string;
  source: string;
  name: string;
  date: Date;
  map: string;
  categories: Category[];
}

export interface Category {
  name: string;
  controls: number;
  distance: number;
  ascent: number;
  runners: Runner[];
}

export interface Course {
  id: string;
  name: string;
  controls: number;
  distance: number;
  ascent: number;
  runners: number;
}

export interface Leg {
  id: string;
  from: string;
  to: string;
  categories: string[];
  runners: number;
  errorFrequency: number;
}

export interface Control {
  code: string;
  errorFrequency: number;
  categories: string[];
  runners: number;
}

export interface ControlCategory {
  name: string;
  runners: number;
}

export interface ControlLeg {
  code: string;
  leg: string;
  categories: string;
  runners: number;
  errors: number;
  errorFrequency: number;
}

export interface ControlDetails {
  code: string;
  categories: ControlCategory[];
  from: ControlLeg[];
  to: ControlLeg[];
}

export interface LegDetails {
  id: string;
  from: string;
  to: string;
  categories: string[];
  runners: LegRunner[];
}

export interface LegRunner {
  id: number;
  fullName: string;
  yearOfBirth: string;
  city: string;
  club: string;
  split: string;
  category: string;
  splitRank: number;
  timeLoss?: string;
}

export interface Runner {
  id: string;
  fullName: string;
  yearOfBirth?: string;
  category: string;
  sex?: Sex;
  club?: string;
  city?: string;
  startTime: string;
  time?: string;
  splits: Split[];
}

export enum Sex {
    male = 'm',
    female = 'f'
}

export interface Split {
  code: string;
  time?: string;
}

export interface StartTimeRunner {
  id: string;
  fullName: string;
  category: string;
  startTime: string;
  time: string;
  rank?: number;
  club?: string;
  city?: string;
}

export interface StartTimeCategory {
  name: string;
  runners: StartTimeRunner[];
}

export interface StartTimeResponse {
  categories: StartTimeCategory[];
}
