/*
 * Copyright 2026 Simon Raess
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { parseTime } from "@rasifix/orienteering-utils";
import { Runner } from "@rasifix/orienteering-utils/lib/model/runner";
import { Category } from "../types/index.ts";

export interface CourseBase {
  id: string;
  name: string;
  distance: number;
  ascent: number;
  controls: number;
}

export interface CourseSummary extends CourseBase {
  runners: number;
}

export interface CourseDetail extends CourseBase {
  runners: Runner[];
}

export function buildCourseSummaries(categories: Category[]): CourseSummary[] {
  const courses: CourseSummary[] = [];

  categories.forEach((category) => {
    if (category.runners.length === 0) {
      return;
    }

    const sequences: { [key: string]: Runner[] } = {};
    category.runners.forEach((runner) => {
      if (!runner.splits || runner.splits.length === 0) {
        return;
      }
      const controls = runner.splits.map((split) => split.code).join("-");
      if (!sequences[controls]) {
        sequences[controls] = [];
      }
      sequences[controls].push(runner);
    });

    const seqKeys = Object.keys(sequences).sort();
    const hasMultiple = seqKeys.length > 1;

    seqKeys.forEach((seq, index) => {
      const runners = sequences[seq];
      const suffix = hasMultiple ? String.fromCharCode(65 + index) : "";
      const id = category.name + suffix;
      courses.push({
        id: id,
        name: id,
        distance: category.distance ?? 0,
        ascent: category.ascent ?? 0,
        controls: runners[0].splits.length,
        runners: runners.length,
      });
    });
  });

  courses.sort((c1, c2) => {
    if (c1.id < c2.id) {
      return -1;
    } else if (c1.id > c2.id) {
      return 1;
    } else {
      return 0;
    }
  });

  return courses;
}

/**
 * Builds detailed course list (with full runner objects)
 */
export function buildCourseDetails(categories: Category[]): CourseDetail[] {
  const courses: CourseDetail[] = [];

  categories.forEach((category) => {
    if (category.runners.length === 0) {
      return;
    }

    const sequences: { [key: string]: Runner[] } = {};
    category.runners.forEach((runner) => {
      if (!runner.splits || runner.splits.length === 0) {
        return;
      }
      const controls = runner.splits.map((split) => split.code).join("-");
      if (!sequences[controls]) {
        sequences[controls] = [];
      }
      sequences[controls].push(runner);
    });

    const seqKeys = Object.keys(sequences).sort();
    const hasMultiple = seqKeys.length > 1;

    seqKeys.forEach((seq, index) => {
      const runners = sequences[seq];
      const suffix = hasMultiple ? String.fromCharCode(65 + index) : "";
      const id = category.name + suffix;
      let idx = 0;
      courses.push({
        id: id,
        name: id,
        distance: category.distance ?? 0,
        ascent: category.ascent ?? 0,
        controls: runners[0].splits.length,
        runners: runners.map((runner) => ({
          id: "" + ++idx,
          startTime: runner.startTime,
          yearOfBirth: runner.yearOfBirth,
          time: runner.time,
          splits: runner.splits,
          club: runner.club,
          fullName: runner.fullName,
          city: runner.city,
          category: category.name,
        })),
      });
    });
  });

  courses
    .sort((c1, c2) => {
      if (c1.id < c2.id) {
        return -1;
      } else if (c1.id > c2.id) {
        return 1;
      } else {
        return 0;
      }
    })
    .forEach((course) => {
      // sort the runners according to their run time
      course.runners.sort((r1, r2) => {
        const t1 = parseTime(r1.time);
        const t2 = parseTime(r2.time);
        if (t1 === null && t2 === null) {
          return 0;
        } else if (t1 !== null && t2 === null) {
          return -1;
        } else if (t1 === null && t2 !== null) {
          return 1;
        } else {
          return (parseTime(r1.time) ?? 0) - (parseTime(r2.time) ?? 0);
        }
      });
    });

  return courses;
}
