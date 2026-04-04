"""
Route: /api/upload
Recebe arquivos xlsx/csv ou URL do Google Sheets
e retorna um resumo estruturado dos dados.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os

from services.data_processor import parse_file, parse_google_sheets

router = APIRouter()

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 50)) * 1024 * 1024  # bytes


@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo xlsx ou csv e retorna
    um resumo estruturado para uso no agente de IA.
    """
    # Valida extensão
    allowed_extensions = {"xlsx", "xlsm", "xls", "csv"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado: .{ext}. Use: xlsx, csv"
        )

    # Lê bytes
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande. Máximo: {os.getenv('MAX_FILE_SIZE_MB', 50)}MB"
        )

    try:
        summary = parse_file(content, file.filename)
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "summary": summary,
        })
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao processar arquivo: {str(e)}")


class SheetsRequest(BaseModel):
    url: str


@router.post("/sheets")
async def upload_sheets(body: SheetsRequest):
    """
    Conecta ao Google Sheets via URL pública e retorna
    um resumo estruturado dos dados.
    """
    if not body.url or "spreadsheets" not in body.url:
        raise HTTPException(
            status_code=400,
            detail="URL inválida. Use o link de compartilhamento do Google Sheets."
        )
    try:
        summary = parse_google_sheets(body.url)
        return JSONResponse(content={
            "success": True,
            "url": body.url,
            "summary": summary,
        })
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erro ao conectar Sheets: {str(e)}")
