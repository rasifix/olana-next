import api from './api';
import { Competition, Course, Category, Leg, LegDetails, Control, ControlDetails, StartTimeRunner, StartTimeResponse } from '../types';
import { buildCourseSummaries, buildCourseDetails } from './course-builder';
import { buildLegs, buildDetailedLegs } from './leg-builder';
import { parseTime } from '@rasifix/orienteering-utils';

interface ResponseWrapper {
    events: Competition[];
}

export const competitionService = {
  async getCompetitions(): Promise<Competition[]> {
    const response = await api.get<ResponseWrapper>('/events?year=2025');
    const competitions = response.data.events.filter(competition => competition !== null && competition.date && competition.name && competition.name !== 'TEST OL' && competition.name !== 'tom test' && competition.name !== 'test OL');
    
    // Deduplicate by name and date, preferring picoevents source
    const deduplicated = new Map<string, Competition>();
    
    for (const competition of competitions) {
      const key = `${competition.name}_${new Date(competition.date).toISOString()}`;
      const existing = deduplicated.get(key);
      
      if (!existing) {
        deduplicated.set(key, competition);
      } else if (competition.source === 'picoevents' && existing.source !== 'picoevents') {
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

  async getCourseRankings(source: string, id: string, courseCode: string): Promise<Category> {
    const competition = await this.getCompetitionById(source, id);
    const courseDetails = buildCourseDetails(competition.categories || []);
    const course = courseDetails.find(c => c.id === courseCode);
    
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
      runners: course.runners
    };
  },

  async getLegs(source: string, id: string): Promise<Leg[]> {
    const competition = await this.getCompetitionById(source, id);
    const legs = buildLegs(competition.categories || []);
    return legs;
  },

  async getLegDetails(source: string, id: string, legId: string): Promise<LegDetails> {
    const competition = await this.getCompetitionById(source, id);
    const legs = buildDetailedLegs(competition.categories || []);
    const leg = legs.find(l => l.id === legId);
    
    if (!leg) {
      throw new Error(`Leg ${legId} not found`);
    }
    
    return {
      id: leg.id,
      from: leg.from,
      to: leg.to,
      categories: leg.categories,
      runners: leg.runners.map(r => ({
        ...r,
        id: Number(r.id) || 0,
        yearOfBirth: r.yearOfBirth?.toString() || '',
        city: r.city || '',
        club: r.club || '',
        splitRank: r.splitRank || 0
      }))
    };
  },

  async getControls(source: string, id: string): Promise<Control[]> {
    const response = await api.get<Control[]>(`/events/${source}/${id}/controls`);
    return response.data;
  },

  async getControlDetails(source: string, id: string, controlCode: string): Promise<ControlDetails> {
    const response = await api.get<ControlDetails>(`/events/${source}/${id}/controls/${controlCode}`);
    return response.data;
  },

  async getStartTimes(source: string, id: string): Promise<StartTimeRunner[]> {
    const response = await api.get<StartTimeResponse>(`/events/${source}/${id}/starttime`);
    // Flatten the categories array into a single array of runners
    const allRunners = response.data.categories.flatMap(category => 
      category.runners.map(runner => ({
        ...runner,
        category: category.name // Ensure category name is set from the parent
      }))
    );
    return allRunners;
  },
};
