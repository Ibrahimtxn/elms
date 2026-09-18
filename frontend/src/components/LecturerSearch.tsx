import { useNavigate } from "react-router-dom";

import { academicApi } from "@/api/academic";
import { enrollmentApi } from "@/api/enrollment";
import { useAuth } from "@/auth/AuthContext";
import { RoleSearchBox, SearchResult } from "./RoleSearchBox";

export function LecturerSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const search = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase();
    const [classes, courses] = await Promise.all([academicApi.listClasses(), academicApi.listCourses()]);
    const myClasses = classes.filter((c) => c.lecturer_id === user?.id);

    // Search 1: match against your own class/course names -> jump to that class's roster.
    const classMatches = myClasses
      .filter((c) => {
        const course = courses.find((co) => co.id === c.course_id);
        return course && (course.title.toLowerCase().includes(q) || course.code.toLowerCase().includes(q));
      })
      .map((c) => {
        const course = courses.find((co) => co.id === c.course_id)!;
        return {
          id: `class-${c.id}`,
          label: `${course.code} — ${course.title}`,
          sublabel: "View class roster",
          onSelect: () => navigate(`/classes/${c.id}?tab=roster`),
        };
      });

    // Search 2: match against enrolled student names/emails across your classes.
    const rosters = await Promise.all(myClasses.map((c) => enrollmentApi.classRoster(c.id).catch(() => [])));
    const studentMatches: SearchResult[] = [];
    rosters.forEach((roster, idx) => {
      roster.forEach((entry) => {
        if (
          entry.student_name.toLowerCase().includes(q) ||
          entry.student_email.toLowerCase().includes(q)
        ) {
          const klass = myClasses[idx];
          const course = courses.find((co) => co.id === klass.course_id);
          studentMatches.push({
            id: `student-${entry.enrollment_id}`,
            label: entry.student_name,
            sublabel: `Enrolled in ${course?.code ?? "your class"}`,
            onSelect: () => navigate(`/classes/${klass.id}?tab=roster`),
          });
        }
      });
    });

    return [...classMatches, ...studentMatches].slice(0, 8);
  };

  return <RoleSearchBox placeholder="Search your classes or students…" search={search} />;
}