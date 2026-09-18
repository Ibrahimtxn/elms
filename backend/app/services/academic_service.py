from app.core.errors import ConflictError, NotFoundError
from app.models.academic import Department, Level, AcademicYear, Course, Class
from app.repositories.academic_repository import (
    DepartmentRepository,
    LevelRepository,
    AcademicYearRepository,
    CourseRepository,
    ClassRepository,
)
from app.schemas.academic import (
    DepartmentCreate,
    LevelCreate,
    AcademicYearCreate,
    CourseCreate,
    ClassCreate,
)


class AcademicService:
    def __init__(
        self,
        departments: DepartmentRepository,
        levels: LevelRepository,
        years: AcademicYearRepository,
        courses: CourseRepository,
        classes: ClassRepository,
    ):
        self.departments = departments
        self.levels = levels
        self.years = years
        self.courses = courses
        self.classes = classes

    # --- Department ---
    def create_department(self, data: DepartmentCreate) -> Department:
        if self.departments.get_by_code(data.code):
            raise ConflictError(f"Department code '{data.code}' already exists.")
        return self.departments.create(Department(name=data.name, code=data.code))

    # --- Level ---
    def create_level(self, data: LevelCreate) -> Level:
        return self.levels.create(Level(name=data.name, ordering=data.ordering))

    # --- Academic Year ---
    def create_academic_year(self, data: AcademicYearCreate) -> AcademicYear:
        return self.years.create(
            AcademicYear(
                name=data.name,
                start_date=data.start_date,
                end_date=data.end_date,
                is_current=data.is_current,
            )
        )

    # --- Course ---
    def create_course(self, data: CourseCreate) -> Course:
        if self.courses.get_by_code(data.code):
            raise ConflictError(f"Course code '{data.code}' already exists.")
        if not self.departments.get(data.department_id):
            raise NotFoundError("Department not found.")
        if not self.levels.get(data.level_id):
            raise NotFoundError("Level not found.")
        return self.courses.create(
            Course(
                code=data.code,
                title=data.title,
                description=data.description,
                credit_units=data.credit_units,
                department_id=data.department_id,
                level_id=data.level_id,
            )
        )

    # --- Class (course offering) ---
    def create_class(self, data: ClassCreate) -> Class:
        if not self.courses.get(data.course_id):
            raise NotFoundError("Course not found.")
        if not self.years.get(data.academic_year_id):
            raise NotFoundError("Academic year not found.")
        if not self.levels.get(data.level_id):
            raise NotFoundError("Level not found.")
        return self.classes.create(
            Class(
                course_id=data.course_id,
                academic_year_id=data.academic_year_id,
                level_id=data.level_id,
                lecturer_id=data.lecturer_id,
            )
        )

        # --- Updates (no deletes - entities are managed, not removed) ---
    def update_department(self, department_id: int, data) -> Department:
        dept = self.departments.get(department_id)
        if not dept:
            raise NotFoundError("Department not found.")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(dept, field, value)
        return self.departments.save(dept)

    def update_level(self, level_id: int, data) -> Level:
        level = self.levels.get(level_id)
        if not level:
            raise NotFoundError("Level not found.")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(level, field, value)
        return self.levels.save(level)

    def update_academic_year(self, year_id: int, data) -> AcademicYear:
        year = self.years.get(year_id)
        if not year:
            raise NotFoundError("Academic year not found.")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(year, field, value)
        return self.years.save(year)

    def update_course(self, course_id: int, data) -> Course:
        course = self.courses.get(course_id)
        if not course:
            raise NotFoundError("Course not found.")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(course, field, value)
        return self.courses.save(course)

    def update_class(self, class_id: int, data) -> Class:
        klass = self.classes.get(class_id)
        if not klass:
            raise NotFoundError("Class not found.")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(klass, field, value)
        return self.classes.save(klass)