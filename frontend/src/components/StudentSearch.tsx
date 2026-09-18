import { useNavigate } from "react-router-dom";

import { academicApi } from "@/api/academic";
import { RoleSearchBox, SearchResult } from "./RoleSearchBox";

export function StudentSearch() {
  const navigate = useNavigate();

  const search = async (query: string): Promise<SearchResult[]> => {
    const [courses, classes] = await Promise.all([academicApi.listCourses(), academicApi.listClasses()]);
    const q = query.toLowerCase();
    const matches = courses.filter((c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));

    return matches.slice(0, 8).map((course) => {
      const klass = classes.find((cl) => cl.course_id === course.id);
      return {
        id: String(course.id),
        label: `${course.code} — ${course.title}`,
        sublabel: `${course.credit_units} units`,
        onSelect: () => navigate(klass ? `/classes/${klass.id}` : "/catalogue"),
      };
    });
  };

  return <RoleSearchBox placeholder="Search your courses…" search={search} />;
}