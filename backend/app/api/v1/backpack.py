from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.backpack_repository import BackpackRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.material_repository import MaterialRepository
from app.schemas.backpack import SaveMaterialToBackpack, BackpackItemOut
from app.services.backpack_service import BackpackService

router = APIRouter()


def get_backpack_service(db: Session = Depends(get_db)) -> BackpackService:
    return BackpackService(
        BackpackRepository(db), MaterialRepository(db), ClassRepository(db), EnrollmentRepository(db)
    )


@router.get("/backpack", response_model=list[BackpackItemOut])
def list_backpack(
    current_user: User = Depends(get_current_user),
    service: BackpackService = Depends(get_backpack_service),
):
    return service.list_mine(current_user)


@router.post("/backpack/materials", response_model=BackpackItemOut, status_code=201)
def save_material_to_backpack(
    data: SaveMaterialToBackpack,
    current_user: User = Depends(get_current_user),
    service: BackpackService = Depends(get_backpack_service),
):
    return service.save_material(current_user, data)


@router.post("/backpack/uploads", response_model=BackpackItemOut, status_code=201)
def upload_to_backpack(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: BackpackService = Depends(get_backpack_service),
):
    return service.upload_personal_file(current_user, title, file)


@router.delete("/backpack/{item_id}", status_code=204)
def remove_from_backpack(
    item_id: int,
    current_user: User = Depends(get_current_user),
    service: BackpackService = Depends(get_backpack_service),
):
    service.remove(current_user, item_id)