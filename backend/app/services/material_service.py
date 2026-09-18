from fastapi import UploadFile

from app.core.errors import NotFoundError, PermissionDeniedError
from app.core.storage import save_upload, delete_upload
from app.models.content import Material
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.material_repository import MaterialRepository


class MaterialService:
    def __init__(
        self,
        materials: MaterialRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
    ):
        self.materials = materials
        self.classes = classes
        self.enrollments = enrollments

    def _can_manage_class(self, user: User, class_id: int) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        klass = self.classes.get(class_id)
        return bool(klass and klass.lecturer_id == user.id)

    def _can_view_class(self, user: User, class_id: int) -> bool:
        if self._can_manage_class(user, class_id):
            return True
        return bool(self.enrollments.get_by_student_and_class(user.id, class_id))

    def upload_material(
        self, user: User, class_id: int, title: str, description: str | None, file: UploadFile
    ) -> Material:
        klass = self.classes.get(class_id)
        if not klass:
            raise NotFoundError("Class not found.")
        if not self._can_manage_class(user, class_id):
            raise PermissionDeniedError("You do not teach this class.")

        file_path = save_upload(file, subfolder="materials")
        material = Material(
            class_id=class_id,
            uploaded_by=user.id,
            title=title,
            description=description,
            file_path=file_path,
        )
        return self.materials.create(material)

    def list_materials(self, user: User, class_id: int) -> list[Material]:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        if not self._can_view_class(user, class_id):
            raise PermissionDeniedError("You are not enrolled in this class.")
        return self.materials.list_for_class(class_id)

    def delete_material(self, user: User, material_id: int) -> None:
        material = self.materials.get(material_id)
        if not material:
            raise NotFoundError("Material not found.")
        if not self._can_manage_class(user, material.class_id):
            raise PermissionDeniedError("You cannot delete this material.")

        delete_upload(material.file_path)
        self.materials.delete(material)