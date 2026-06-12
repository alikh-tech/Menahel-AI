import { DEMO_COURSES } from "@/lib/constants";
import type { CourseGrade } from "@/types";

export interface SemesterAverage {
  semester: string;
  average: number;
  cumulativeAverage: number;
  credits: number;
}

export interface AcademicStats {
  average: string;
  creditsEarned: number;
  creditsRequired: number;
  activeCourses: number;
}

// Degree credit requirement - not derivable from course data, so kept as a constant.
const CREDITS_REQUIRED = 120;

/**
 * Derives the academic summary stats (average, credits earned, active
 * courses) from the same course list backing the grades table and GPA
 * trend chart, so the dashboard, profile, and grades pages never disagree.
 */
export function computeAcademicStats(courses: CourseGrade[] = DEMO_COURSES): AcademicStats {
  const creditsEarned = courses.reduce((sum, c) => sum + c.credits, 0);
  const points = courses.reduce((sum, c) => sum + c.grade * c.credits, 0);
  const average = creditsEarned > 0 ? points / creditsEarned : 0;

  return {
    average: average.toFixed(1),
    creditsEarned,
    creditsRequired: CREDITS_REQUIRED,
    activeCourses: courses.length,
  };
}

/**
 * Computes per-semester weighted averages and a running cumulative (GPA
 * trend) average, in the order semesters first appear in `courses`.
 */
export function computeSemesterAverages(courses: CourseGrade[] = DEMO_COURSES): SemesterAverage[] {
  const order: string[] = [];
  const bySemester = new Map<string, CourseGrade[]>();

  for (const course of courses) {
    if (!bySemester.has(course.semester)) {
      order.push(course.semester);
      bySemester.set(course.semester, []);
    }
    bySemester.get(course.semester)!.push(course);
  }

  let cumulativePoints = 0;
  let cumulativeCredits = 0;

  return order.map((semester) => {
    const semesterCourses = bySemester.get(semester)!;
    const credits = semesterCourses.reduce((sum, c) => sum + c.credits, 0);
    const points = semesterCourses.reduce((sum, c) => sum + c.grade * c.credits, 0);

    cumulativePoints += points;
    cumulativeCredits += credits;

    return {
      semester,
      average: credits > 0 ? Math.round((points / credits) * 10) / 10 : 0,
      cumulativeAverage: cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 10) / 10 : 0,
      credits,
    };
  });
}
