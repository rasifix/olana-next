# Plan: Add Runner Details to Course & Custom Category Pages

Currently, [RunnerDetailsPage](src/pages/RunnerDetailsPage.tsx) shows individual runner splits for category runners. You want the same functionality for courses (multiple categories) and custom categories (selected runners/legs). This requires making runner names clickable in [CourseDetailsPage](src/pages/CourseDetailsPage.tsx) and [CustomCategoryPage](src/pages/CustomCategoryPage.tsx), adding routes, and creating/adapting detail pages.

## Steps

1. **Update [CourseDetailsPage](src/pages/CourseDetailsPage.tsx)** to add `renderName` prop on [RankingTable](src/components/RankingTable.tsx) that links to `/competitions/:source/:id/courses/:courseCode/runners/:runnerId`

2. **Update [CustomCategoryPage](src/pages/CustomCategoryPage.tsx)** to add `renderName` prop on [RankingTable](src/components/RankingTable.tsx) that links to `/competitions/:source/:id/custom/runners/:runnerId`

3. **Create CourseRunnerDetailsPage** component that fetches course data via `getCourseRankings`, finds the runner by ID, and displays splits in the same format as [RunnerDetailsPage](src/pages/RunnerDetailsPage.tsx)

4. **Create CustomCategoryRunnerDetailsPage** component that reconstructs custom category data (selected categories + legs) and displays runner splits similar to [RunnerDetailsPage](src/pages/RunnerDetailsPage.tsx)

5. **Add two new routes** in [App.tsx](src/App.tsx): `/competitions/:source/:id/courses/:courseCode/runners/:runnerId` → CourseRunnerDetailsPage, and `/competitions/:source/:id/custom/runners/:runnerId` → CustomCategoryRunnerDetailsPage

## Further Considerations

1. **Data persistence for custom categories**: Custom category selections (which categories, which legs) are client-side only. The new runner detail route needs this context. Pass via URL params/query string

2. **Code reuse**: All three runner detail pages show nearly identical splits tables. Create a `RunnerSplitsTable` component to avoid duplication

3. **Breadcrumb navigation**: runner detail pages link back to their parent (course/custom category).CourseDetailsPage already has category links; maintaining consistent navigation helps UX.
