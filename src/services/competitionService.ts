import api from "./api";
import {
  Competition,
  Course,
  Category,
  Leg,
  LegDetails,
  Control,
  ControlDetails,
  StartTimeRunner,
  StartTimeResponse,
} from "../types";
import { buildCourseSummaries, buildCourseDetails } from "./course-builder";
import { buildLegs, buildDetailedLegs } from "./leg-builder";
import defineControl, { defineControls } from "./control-builder";
import { parseTime } from "@rasifix/orienteering-utils";

interface ResponseWrapper {
  events: Competition[];
}

export const competitionService = {
  async getCompetitions(): Promise<Competition[]> {
    const response = await api.get<ResponseWrapper>("/events?year=2025");
    const competitions = response.data.events.filter(
      (competition) =>
        competition !== null &&
        competition.date &&
        competition.name &&
        competition.name !== "TEST OL" &&
        competition.name !== "tom test" &&
        competition.name !== "test OL"
    );

    // Deduplicate by name and date, preferring picoevents source
    const deduplicated = new Map<string, Competition>();

    for (const competition of competitions) {
      const key = `${competition.name}_${new Date(
        competition.date
      ).toISOString()}`;
      const existing = deduplicated.get(key);

      if (!existing) {
        deduplicated.set(key, competition);
      } else if (
        competition.source === "picoevents" &&
        existing.source !== "picoevents"
      ) {
        // Prefer picoevents source over others
        deduplicated.set(key, competition);
      }
    }

    return Array.from(deduplicated.values());
  },

  async getCompetitionById(source: string, id: string): Promise<Competition> {
    const response = await api.get<Competition>(`/events/${source}/${id}`);
    return response.data;
  },

  async getCourses(source: string, id: string): Promise<Course[]> {
    const competition = await this.getCompetitionById(source, id);
    const courseSummaries = buildCourseSummaries(competition.categories || []);
    return courseSummaries;
  },

  async getCourseRankings(
    source: string,
    id: string,
    courseCode: string
  ): Promise<Category> {
    const competition = await this.getCompetitionById(source, id);
    const courseDetails = buildCourseDetails(competition.categories || []);
    const course = courseDetails.find((c) => c.id === courseCode);

    if (!course) {
      throw new Error(`Course ${courseCode} not found`);
    }

    course.runners.sort((a, b) => {
      const timeA = parseTime(a.time) || Number.MAX_VALUE;
      const timeB = parseTime(b.time) || Number.MAX_VALUE;
      return timeA - timeB;
    });

    // Return course data in Category format for compatibility
    return {
      name: course.name,
      controls: course.controls,
      distance: course.distance,
      ascent: course.ascent,
      runners: course.runners,
    };
  },

  async getLegs(source: string, id: string): Promise<Leg[]> {
    const competition = await this.getCompetitionById(source, id);
    const legs = buildLegs(competition.categories || []);
    console.log('getLegs result:', legs.slice(0, 2)); // Debug: check first 2 legs
    return legs;
  },

  async getLegDetails(
    source: string,
    id: string,
    legId: string
  ): Promise<LegDetails> {
    const competition = await this.getCompetitionById(source, id);
    const legs = buildDetailedLegs(competition.categories || []);
    const leg = legs.find((l) => l.id === legId);

    if (!leg) {
      throw new Error(`Leg ${legId} not found`);
    }

    return {
      id: leg.id,
      from: leg.from,
      to: leg.to,
      categories: leg.categories,
      runners: leg.runners.map((r) => ({
        ...r,
        id: Number(r.id) || 0,
        yearOfBirth: r.yearOfBirth?.toString() || "",
        city: r.city || "",
        club: r.club || "",
        splitRank: r.splitRank || 0,
      })),
    };
  },

  async getControls(source: string, id: string): Promise<Control[]> {
    const competition = await this.getCompetitionById(source, id);
    return defineControls(competition.categories || []);
  },

  async getControlDetails(
    source: string,
    id: string,
    controlCode: string
  ): Promise<ControlDetails> {
    const competition = await this.getCompetitionById(source, id);
    return defineControl(competition.categories || [], controlCode);
  },

  async getStartTimes(source: string, id: string): Promise<StartTimeRunner[]> {
    const competition = await this.getCompetitionById(source, id);

    const result: StartTimeRunner[] = [];

    competition.categories.forEach((category) => {
      let last: number | null = null;
      let pos = 1;
      const filtered = category.runners.filter(
        (runner) => parseTime(runner.time) !== null
      );
      filtered.forEach((runner, idx) => {
        if (last != null) {
          if ((parseTime(runner.time) ?? 0) > last) {
            pos = idx + 1;
          }
        }
        const point = {
          id: runner.id,
          startTime: runner.startTime!,
          time: runner.time!,
          rank: pos,
          fullName: runner.fullName,
          sex: runner.sex,
          category: category.name,
        };
        last = parseTime(runner.time)!;
        result.push(point);
      });
    });

    return result;
  },
};
