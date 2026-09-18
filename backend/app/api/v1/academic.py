"""
Academic structure CRUD. Reads are open to any authenticated user;
writes (create) are admin-only.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.repositories.academic_repository import (
    DepartmentRepository,
    LevelRepository,
    AcademicYearRepository,
    CourseRepository,
    ClassRepository,
)
from app.schemas.academic import (
    DepartmentCreate, DepartmentOut, DepartmentUpdate,
    LevelCreate, LevelOut, LevelUpdate,
    AcademicYearCreate, AcademicYearOut, AcademicYearUpdate,
    CourseCreate, CourseOut, CourseUpdate,
    ClassCreate, ClassOut, ClassUpdate,
)
from app.services.academic_service import AcademicService

router = APIRouter()
admin_only = require_roles(UserRole.ADMIN)


def get_academic_service(db: Session = Depends(get_db)) -> AcademicService:
    return AcademicService(
        departments=DepartmentRepository(db),
        levels=LevelRepository(db),
        years=AcademicYearRepository(db),
        courses=CourseRepository(db),
        classes=ClassRepository(db),
    )


# --- Departments ---
@router.get("/departments", response_model=list[DepartmentOut], dependencies=[Depends(get_current_user)])
def list_departments(service: AcademicService = Depends(get_academic_service)):
    return service.departments.list_all()


@router.post("/departments", response_model=DepartmentOut, status_code=201, dependencies=[Depends(admin_only)])
def create_department(data: DepartmentCreate, service: AcademicService = Depends(get_academic_service)):
    return service.create_department(data)


# --- Levels ---
@router.get("/levels", response_model=list[LevelOut], dependencies=[Depends(get_current_user)])
def list_levels(service: AcademicService = Depends(get_academic_service)):
    return service.levels.list_all()


@router.post("/levels", response_model=LevelOut, status_code=201, dependencies=[Depends(admin_only)])
def create_level(data: LevelCreate, service: AcademicService = Depends(get_academic_service)):
    return service.create_level(data)


# --- Academic Years ---
@router.get("/academic-years", response_model=list[AcademicYearOut], dependencies=[Depends(get_current_user)])
def list_academic_years(service: AcademicService = Depends(get_academic_service)):
    return service.years.list_all()


@router.post("/academic-years", response_model=AcademicYearOut, status_code=201, dependencies=[Depends(admin_only)])
def create_academic_year(data: AcademicYearCreate, service: AcademicService = Depends(get_academic_service)):
    return service.create_academic_year(data)


# --- Courses ---
@router.get("/courses", response_model=list[CourseOut], dependencies=[Depends(get_current_user)])
def list_courses(service: AcademicService = Depends(get_academic_service)):
    return service.courses.list_all()


@router.post("/courses", response_model=CourseOut, status_code=201, dependencies=[Depends(admin_only)])
def create_course(data: CourseCreate, service: AcademicService = Depends(get_academic_service)):
    return service.create_course(data)


# --- Classes (course offerings) ---
@router.get("/classes", response_model=list[ClassOut], dependencies=[Depends(get_current_user)])
def list_classes(service: AcademicService = Depends(get_academic_service)):
    return service.classes.list_all()


@router.post("/classes", response_model=ClassOut, status_code=201, dependencies=[Depends(admin_only)])
def create_class(data: ClassCreate, service: AcademicService = Depends(get_academic_service)):
    return service.create_class(data)

@router.patch("/departments/{department_id}", response_model=DepartmentOut, dependencies=[Depends(admin_only)])
def update_department(department_id: int, data: DepartmentUpdate, service: AcademicService = Depends(get_academic_service)):
    return service.update_department(department_id, data)


@router.patch("/levels/{level_id}", response_model=LevelOut, dependencies=[Depends(admin_only)])
def update_level(level_id: int, data: LevelUpdate, service: AcademicService = Depends(get_academic_service)):
    return service.update_level(level_id, data)


@router.patch("/academic-years/{year_id}", response_model=AcademicYearOut, dependencies=[Depends(admin_only)])
def update_academic_year(year_id: int, data: AcademicYearUpdate, service: AcademicService = Depends(get_academic_service)):
    return service.update_academic_year(year_id, data)


@router.patch("/courses/{course_id}", response_model=CourseOut, dependencies=[Depends(admin_only)])
def update_course(course_id: int, data: CourseUpdate, service: AcademicService = Depends(get_academic_service)):
    return service.update_course(course_id, data)


@router.patch("/classes/{class_id}", response_model=ClassOut, dependencies=[Depends(admin_only)])
def update_class(class_id: int, data: ClassUpdate, service: AcademicService = Depends(get_academic_service)):
    return service.update_class(class_id, data)