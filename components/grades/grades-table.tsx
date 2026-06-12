import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_COURSES } from "@/lib/constants";
import { computeSemesterAverages } from "@/lib/academics";

function gradeVariant(grade: number): "success" | "warning" | "destructive" {
  if (grade >= 85) return "success";
  if (grade >= 70) return "warning";
  return "destructive";
}

export function GradesTable() {
  const semesterAverages = computeSemesterAverages();
  const order = semesterAverages.map((s) => s.semester);

  return (
    <div className="space-y-4">
      {order.map((semester, i) => {
        const courses = DEMO_COURSES.filter((c) => c.semester === semester);
        const summary = semesterAverages.find((s) => s.semester === semester)!;

        return (
          <Card key={semester} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-[14px]">{semester}</CardTitle>
              <Badge variant="secondary" className="text-[11px]">
                ממוצע סמסטריאלי: {summary.average}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 text-right font-medium">קוד קורס</th>
                      <th className="py-2 text-right font-medium">שם הקורס</th>
                      <th className="py-2 text-right font-medium">נ&quot;ז</th>
                      <th className="py-2 text-right font-medium">ציון</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.code} className="border-b border-border last:border-0">
                        <td className="py-2.5 text-muted-foreground">{course.code}</td>
                        <td className="py-2.5 font-medium text-foreground">{course.name}</td>
                        <td className="py-2.5 text-muted-foreground">{course.credits}</td>
                        <td className="py-2.5">
                          <Badge variant={gradeVariant(course.grade)} className="text-[11px]">
                            {course.grade}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
