import { apiClient } from "./client";

export interface Department { id: number; name: string; code: string; }
export interface Level { id: number; name: string; ordering: number; }
export interface AcademicYear {
  id: number; name: string; start_date: string; end_date: string; is_current: boolean;
}
export interface Course {
  id: number; code: string; title: string; description: string | null;
  credit_units: number; department_id: number; level_id: number;
}
export interface ClassOffering {
  id: number; course_id: number; academic_year_id: number; level_id: number;
  lecturer_id: number | null; is_active: boolean;
}

export const academicApi = {
  listDepartments: () => apiClient.get<Department[]>("/departments").then((r) => r.data),
  createDepartment: (data: { name: string; code: string }) =>
    apiClient.post<Department>("/departments", data).then((r) => r.data),

  listLevels: () => apiClient.get<Level[]>("/levels").then((r) => r.data),
  createLevel: (data: { name: string; ordering: number }) =>
    apiClient.post<Level>("/levels", data).then((r) => r.data),

  listAcademicYears: () => apiClient.get<AcademicYear[]>("/academic-years").then((r) => r.data),
  createAcademicYear: (data: {
    name: string; start_date: string; end_date: string; is_current: boolean;
  }) => apiClient.post<AcademicYear>("/academic-years", data).then((r) => r.data),

  listCourses: () => apiClient.get<Course[]>("/courses").then((r) => r.data),
  createCourse: (data: {
    code: string; title: string; description?: string; credit_units: number;
    department_id: number; level_id: number;
  }) => apiClient.post<Course>("/courses", data).then((r) => r.data),

  listClasses: () => apiClient.get<ClassOffering[]>("/classes").then((r) => r.data),
  createClass: (data: {
    course_id: number; academic_year_id: number; level_id: number; lecturer_id?: number;
  }) => apiClient.post<ClassOffering>("/classes", data).then((r) => r.data),
};