import { useNavigate } from "react-router-dom";

import { usersApi } from "@/api/users";
import { academicApi } from "@/api/academic";
import { RoleSearchBox, SearchResult } from "./RoleSearchBox";

export function AdminSearch() {
  const navigate = useNavigate();

  const search = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase();
    const [users, courses] = await Promise.all([usersApi.listAll(), academicApi.listCourses()]);

        const userMatches: SearchResult[] = users
      .filter(
        (u) =>
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((u) => ({
        id: `user-${u.id}`,
        label: `${u.first_name} ${u.last_name}`,
        sublabel: u.role === "student" ? `Student · ${u.email} · view enrollment history` : `${u.role} · ${u.email}`,
        onSelect: () =>
          u.role === "student"
            ? navigate(`/enrollment-management?studentId=${u.id}`)
            : navigate("/enrollment-management"),
      }));

    const courseMatches: SearchResult[] = courses
      .filter((c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        id: `course-${c.id}`,
        label: `${c.code} — ${c.title}`,
        sublabel: "View this course's classes",
        onSelect: () => navigate(`/classes?courseId=${c.id}`),
      }));

    return [...userMatches, ...courseMatches];
  };

  return <RoleSearchBox placeholder="Search users, students, courses…" search={search} />;
}