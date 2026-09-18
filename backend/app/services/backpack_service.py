from app.core.errors import ConflictError, NotFoundError, PermissionDeniedError
from app.core.storage import save_upload
from app.models.backpack import BackpackItem
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.backpack_repository import BackpackRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.material_repository import MaterialRepository
from app.schemas.backpack import SaveMaterialToBackpack


class BackpackService:
    def __init__(
        self,
        backpack: BackpackRepository,
        materials: MaterialRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
    ):
        self.backpack = backpack
        self.materials = materials
        self.classes = classes
        self.enrollments = enrollments

    def _can_view_material(self, user: User, class_id: int) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        klass = self.classes.get(class_id)
        if klass and klass.lecturer_id == user.id:
            return True
        return bool(self.enrollments.get_by_student_and_class(user.id, class_id))

    def save_material(self, user: User, data: SaveMaterialToBackpack) -> BackpackItem:
        material = self.materials.get(data.material_id)
        if not material:
            raise NotFoundError("Material not found.")
        if not self._can_view_material(user, material.class_id):
            raise PermissionDeniedError("You do not have access to this material.")
        if self.backpack.already_saved(user.id, data.material_id):
            raise ConflictError("This material is already in your backpack.")

        item = BackpackItem(
            user_id=user.id,
            material_id=data.material_id,
            title=data.title or material.title,
            file_path=None,  # references the material's own file rather than duplicating it
        )
        return self.backpack.create(item)

    def upload_personal_file(self, user: User, title: str, file) -> BackpackItem:
        file_path = save_upload(file, subfolder="backpack")
        item = BackpackItem(user_id=user.id, material_id=None, title=title, file_path=file_path)
        return self.backpack.create(item)

    def list_mine(self, user: User) -> list[BackpackItem]:
        return self.backpack.list_for_user(user.id)

    def remove(self, user: User, item_id: int) -> None:
        item = self.backpack.get(item_id)
        if not item:
            raise NotFoundError("Backpack item not found.")
        if item.user_id != user.id:
            raise PermissionDeniedError("This item does not belong to you.")
        self.backpack.delete(item)