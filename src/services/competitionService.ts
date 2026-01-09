import { parseTime } from "@rasifix/orienteering-utils";
import { oware } from "@rasifix/orienteering-utils/lib/formats";
import {
  Category,
  Competition,
  Control,
  ControlDetails,
  Course,
  Leg,
  LegDetails,
  StartTimeRunner,
} from "../types";
import api from "./api";
import defineControl, { defineControls } from "./control-builder";
import { buildCourseDetails, buildCourseSummaries } from "./course-builder";
import { buildDetailedLegs, buildLegs } from "./leg-builder";

interface ResponseWrapper {
  events: Competition[];
}

// Cache for the parsed test competition
let testCompetition: Competition | null = null;

async function loadTestCompetition(): Promise<Competition> {
  if (testCompetition) {
    return testCompetition;
  }

  try {
    const response = await fetch("/bbn.csv");
    const csvText = await response.text();
    const parser = new oware.OwareFormat();
    const parsed = parser.parse(csvText);

    // Convert to our Competition format with today's date
    testCompetition = {
      id: "test-bbn",
      source: "test",
      name: parsed.name,
      date: new Date("2025-12-31"), // Today's date
      map: parsed.map || "Test Map",
      categories: parsed.categories.map((cat) => ({
        name: cat.name,
        controls: cat.controls || 0,
        distance: cat.distance || 0,
        ascent: cat.ascent || 0,
        runners: cat.runners.map((runner) => ({
          id: runner.id || "",
          fullName: runner.fullName,
          yearOfBirth: runner.yearOfBirth || "",
          sex: runner.sex,
          club: runner.club || "",
          city: runner.city || "",
          category: cat.name,
          startTime: runner.startTime,
          time: runner.time,
          splits: runner.splits || [],
        })),
      })),
    };

    return testCompetition;
  } catch (error) {
    console.error("Error loading test competition:", error);
    throw error;
  }
}

export const competitionService = {
  async getCompetitions(year: number): Promise<Competition[]> {
    const response = await api.get<ResponseWrapper>(`/events?year=${year}`);
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

    const result = Array.from(deduplicated.values());

    // Add test competition for current year
    try {
      const testComp = await loadTestCompetition();
      result.unshift(testComp); // Add at the beginning
    } catch (error) {
      console.error("Failed to load test competition:", error);
    }

    return result;
  },

  async getCompetitionById(source: string, id: string): Promise<Competition> {
    // Check if it's the test competition
    if (source === "test" && id === "test-bbn") {
      return await loadTestCompetition();
    }

    const response = await api.get<Competition>(`/events/${source}/${id}`);
    return response.data;
  },

  getCourses(competition: Competition): Course[] {
    return buildCourseSummaries(competition.categories || []);
  },

  getCourseRankings(competition: Competition, courseCode: string): Category {
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

  getLegs(competition: Competition): Leg[] {
    const legs = buildLegs(competition.categories || []);
    console.log("getLegs result:", legs.slice(0, 2)); // Debug: check first 2 legs
    return legs;
  },

  getLegDetails(competition: Competition, legId: string): LegDetails {
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

  getControls(competition: Competition): Control[] {
    return defineControls(competition.categories || []);
  },

  getControlDetails(
    competition: Competition,
    controlCode: string
  ): ControlDetails {
    return defineControl(competition.categories || [], controlCode);
  },

  getStartTimes(competition: Competition): StartTimeRunner[] {
    const result: StartTimeRunner[] = [];
    const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;

    competition.categories.forEach((category) => {
      let last: number | null = null;
      let pos = 1;
      const filtered = category.runners.filter(
        (runner) => runner.time && timeRegex.test(runner.time)
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
