from fastapi import APIRouter, HTTPException, Depends, Query
from app.utils.database import get_db


router = APIRouter()

@router.post('/send', status_code=201)
def get_assistant_response(message: str , db=Depends(get_db)):
    pass
