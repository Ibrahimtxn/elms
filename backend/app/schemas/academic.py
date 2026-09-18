from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# --- Department ---
class DepartmentCreate(BaseModel):
    name: str
    code: str


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Level ---
class LevelCreate(BaseModel):
    name: str
    ordering: int = 0


class LevelOut(BaseModel):
    id: int
    name: str
    ordering: int

    class Config:
        from_attributes = True


# --- Academic Year ---
class AcademicYearCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False


class AcademicYearOut(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date
    is_current: bool

    class Config:
        from_attributes = True


# --- Course ---
class CourseCreate(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    credit_units: int = 0
    department_id: int
    level_id: int


class CourseOut(BaseModel):
    id: int
    code: str
    title: str
    description: Optional[str]
    credit_units: int
    department_id: int
    level_id: int

    class Config:
        from_attributes = True


# --- Class (a course offering) ---
class ClassCreate(BaseModel):
    course_id: int
    academic_year_id: int
    level_id: int
    lecturer_id: Optional[int] = None


class ClassOut(BaseModel):
    id: int
    course_id: int
    academic_year_id: int
    level_id: int
    lecturer_id: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True

    from typing import Optional as _Optional  # avoids clashing with existing Optional import if aliased differently


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None


class LevelUpdate(BaseModel):
    name: Optional[str] = None
    ordering: Optional[int] = None


class AcademicYearUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    credit_units: Optional[int] = None
    department_id: Optional[int] = None
    level_id: Optional[int] = None


class ClassUpdate(BaseModel):
    lecturer_id: Optional[int] = None
    is_active: Optional[bool] = None