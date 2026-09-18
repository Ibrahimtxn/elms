from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.material_repository import MaterialRepository
from app.schemas.material import MaterialOut
from app.services.material_service import MaterialService

router = APIRouter()


def get_material_service(db: Session = Depends(get_db)) -> MaterialService:
    return MaterialService(
        MaterialRepository(db), ClassRepository(db), EnrollmentRepository(db)
    )


@router.post("/classes/{class_id}/materials", response_model=MaterialOut, status_code=201)
def upload_material(
    class_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: MaterialService = Depends(get_material_service),
):
    return service.upload_material(current_user, class_id, title, description, file)


@router.get("/classes/{class_id}/materials", response_model=list[MaterialOut])
def list_materials(
    class_id: int,
    current_user: User = Depends(get_current_user),
    service: MaterialService = Depends(get_material_service),
):
    return service.list_materials(current_user, class_id)


@router.get("/materials/{material_id}/download")
def download_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    service: MaterialService = Depends(get_material_service),
    db: Session = Depends(get_db),
):
    material = MaterialRepository(db).get(material_id)
    if not material:
        raise NotFoundError("Material not found.")
    # Reuses the same view-permission check as listing.
    service.list_materials(current_user, material.class_id)

    full_path = f"{settings.UPLOAD_DIR}/{material.file_path}"
    return FileResponse(full_path, filename=material.title)


@router.delete("/materials/{material_id}", status_code=204)
def delete_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    service: MaterialService = Depends(get_material_service),
):
    service.delete_material(current_user, material_id)