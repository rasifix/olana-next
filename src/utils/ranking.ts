import { ranking } from '@rasifix/orienteering-utils';
import { Runner } from '../types';

/**
 * Parses a ranking and recalculates overall values at normalized course
 * positions. Normalized positions are needed for courses where runners do the
 * same legs in a different order. The tolerance prevents floating-point drift
 * at a leg boundary from selecting and interpolating along the following leg.
 */
export function parseRanking(runners: Runner[]): ranking.Ranking {
  const parsed = ranking.parseRanking(runners);
  const positionTolerance = 1e-10;

  const timeAtPosition = (runner: ranking.RankingRunner, position: number) => {
    if (position >= 1 - positionTolerance) {
      return runner.splits[runner.splits.length - 1]?.time;
    }

    const splitIndex = runner.splits.findIndex(
      (split) => split.position + positionTolerance >= position
    );
    if (splitIndex < 0) return undefined;

    const split = runner.splits[splitIndex];
    const previousPosition = splitIndex === 0 ? 0 : runner.splits[splitIndex - 1].position;
    const previousTime = splitIndex === 0 ? 0 : runner.splits[splitIndex - 1].time;
    if (previousTime === undefined || split.splitTime === undefined || !split.weight) {
      return undefined;
    }

    const progress = Math.max(0, Math.min(1, (position - previousPosition) / split.weight));
    return previousTime + progress * split.splitTime;
  };

  parsed.runners.forEach((runner) => {
    runner.splits.forEach((split) => {
      if (!split.position || Number.isNaN(split.position)) return;

      const times = parsed.runners
        .map((comparedRunner) => ({
          runner: comparedRunner,
          time: timeAtPosition(comparedRunner, split.position),
        }))
        .filter((entry): entry is { runner: ranking.RankingRunner; time: number } =>
          entry.time !== undefined && entry.time > 0
        )
        .sort((a, b) => a.time - b.time);

      if (times.length === 0) return;

      const fastestTime = times[0].time;
      let rank = 1;

      times.forEach((entry, index) => {
        if (index > 0 && entry.time > times[index - 1].time) rank += 1;
        if (entry.runner.id !== runner.id) return;

        split.overall.rank = rank;
        split.overall.behind = entry.time - fastestTime;
      });
    });
  });

  return parsed;
}
